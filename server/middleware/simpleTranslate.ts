import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';
import OpenAI from 'openai';

// Lista de idiomas soportados
export const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'de', 'it', 'ja'];

// Configuración de Redis para caché
const redisClient = createClient({
  url: process.env.REDISCLOUD_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Demasiados intentos de reconexión a Redis');
        return new Error('Demasiados intentos de reconexión');
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

// Conexión a Redis
let redisConnected = false;

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      redisConnected = true;
      console.log('✅ Conexión exitosa a Redis');
    }
  } catch (err) {
    console.error('❌ Error conectando a Redis:', err);
    console.warn('⚠️ Continuando sin caché Redis. Las traducciones no serán cacheadas.');
    redisConnected = false;
  }
};

// Intentar conectar inmediatamente
connectRedis();

// Configuración del cliente OpenAI para DeepSeek
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';

// Inicializar el cliente OpenAI
const openai = new OpenAI({
  baseURL: DEEPSEEK_API_URL,
  apiKey: DEEPSEEK_API_KEY,
});

// Lista de campos que no deben ser traducidos
const UNTRANSLATABLE_FIELDS = [
  'id', 'slug', 'created_at', 'updated_at', 'email', 'password', 
  '_id', 'userId', 'href', 'src', 'url', 'link', 'path'
];

/**
 * Verifica si un campo debe ser traducido basado en su nombre
 */
function shouldTranslateField(fieldName: string): boolean {
  // No traducir campos en la lista de no traducibles
  if (UNTRANSLATABLE_FIELDS.includes(fieldName)) return false;

  // No traducir campos que terminen con 'Id', 'At', etc.
  if (/^(id|.*Id|.*At|.*_at|.*_id)$/i.test(fieldName)) return false;
  
  // No traducir campos que sean URLs o rutas de archivos
  if (/^(src|url|href|image|path|link|file)$/i.test(fieldName)) return false;

  return true;
}

/**
 * Traduce un texto usando DeepSeek API
 */
async function translateText(
  text: string,
  targetLang: string,
  originalLang: string = 'es'
): Promise<string> {
  // Si el idioma destino es el mismo que el original, o el texto es vacío, devolver sin cambios
  if (targetLang === originalLang || !text || text.trim().length < 3) {
    return text;
  }

  // No traducir URLs o rutas de archivos
  if (text.startsWith('http') || /\.(jpg|jpeg|png|gif|svg|webp|pdf)$/i.test(text)) {
    return text;
  }

  // Generar clave para caché
  const cacheKey = `translate:${targetLang}:${originalLang}:${text.substr(0, 50)}`;

  try {
    // Intentar obtener de caché si Redis está conectado
    if (redisConnected && redisClient.isOpen) {
      try {
        const cachedTranslation = await redisClient.get(cacheKey);
        if (cachedTranslation) {
          return cachedTranslation;
        }
      } catch (error) {
        console.error('❌ Error al acceder a Redis:', error);
      }
    }

    // Si no está en caché, traducir con DeepSeek
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text from ${originalLang} to ${targetLang}. Only return the translated text without explanations.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    });

    const translatedText = completion.choices[0]?.message?.content?.trim() || text;

    // Guardar en caché si Redis está conectado
    if (redisConnected && redisClient.isOpen) {
      try {
        await redisClient.set(cacheKey, translatedText, {
          EX: 60 * 60 * 24 * 30 // 30 días
        });
      } catch (error) {
        console.error('❌ Error al guardar en Redis:', error);
      }
    }

    return translatedText;
  } catch (error) {
    console.error('❌ Error al traducir:', error);
    return text; // En caso de error, devolver el texto original
  }
}

/**
 * Traduce recursivamente todos los valores string en un objeto o array
 */
async function translateData(
  data: any,
  targetLang: string,
  originalLang: string = 'es'
): Promise<any> {
  // Caso base: si es un string, traducirlo
  if (typeof data === 'string') {
    return await translateText(data, targetLang, originalLang);
  }

  // Si es un array, traducir cada elemento
  if (Array.isArray(data)) {
    const translatedArray = [];
    for (const item of data) {
      translatedArray.push(await translateData(item, targetLang, originalLang));
    }
    return translatedArray;
  }

  // Si es un objeto, traducir cada valor según el campo
  if (data !== null && typeof data === 'object') {
    const translatedObject: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (shouldTranslateField(key)) {
        if (typeof value === 'string') {
          translatedObject[key] = await translateText(value, targetLang, originalLang);
        } else if (typeof value === 'object' && value !== null) {
          translatedObject[key] = await translateData(value, targetLang, originalLang);
        } else {
          translatedObject[key] = value;
        }
      } else {
        translatedObject[key] = value;
      }
    }

    return translatedObject;
  }

  // Para otros tipos de datos, devolver sin cambios
  return data;
}

/**
 * Middleware para traducir automáticamente las respuestas JSON
 */
export function simpleTranslateMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Obtener el idioma solicitado de la consulta
  const targetLang = (req.query.lang as string)?.toLowerCase();
  const originalLang = 'es'; // Idioma original (por ahora fijo en español)

  // Si no hay parámetro de idioma, no traducir
  if (!targetLang || !SUPPORTED_LANGUAGES.includes(targetLang)) {
    return next();
  }

  // Si el idioma es el mismo que el original, continuar sin modificar
  if (targetLang === originalLang) {
    return next();
  }

  // Guardar la función original res.json
  const originalJson = res.json.bind(res);

  // Sobrescribir res.json para interceptar la respuesta
  res.json = function (body: any) {
    // Si el cuerpo está vacío o no es un objeto, continuar sin modificar
    if (!body || typeof body !== 'object') {
      return originalJson(body);
    }

    translateData(body, targetLang, originalLang)
      .then(translatedBody => {
        // Asegurarse de que las rutas de las imágenes sean absolutas
        if (translatedBody && typeof translatedBody === 'object') {
          const processImagePaths = (obj: any) => {
            for (const key in obj) {
              if (typeof obj[key] === 'string' && 
                  (key.toLowerCase().includes('image') || 
                   key.toLowerCase().includes('src') || 
                   key.toLowerCase().includes('url')) &&
                  !obj[key].startsWith('http') && 
                  !obj[key].startsWith('/')) {
                obj[key] = `/${obj[key]}`;
              } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                processImagePaths(obj[key]);
              }
            }
          };
          processImagePaths(translatedBody);
        }

        // Restaurar el método original y enviar la respuesta traducida
        res.json = originalJson;
        return originalJson(translatedBody);
      })
      .catch(error => {
        console.error('❌ Error en la traducción:', error);
        // En caso de error, restaurar el método original y enviar la respuesta sin traducir
        res.json = originalJson;
        return originalJson(body);
      });

    return res;
  };

  next();
} 