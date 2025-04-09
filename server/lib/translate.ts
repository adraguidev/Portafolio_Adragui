import { createClient } from 'redis';
import OpenAI from 'openai';

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
      console.log('Conexión exitosa a Redis');
    }
  } catch (err) {
    console.error('Error conectando a Redis:', err);
    console.warn('Continuando sin caché Redis. Las traducciones no serán cacheadas.');
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

// Validar la configuración al inicio
if (!DEEPSEEK_API_KEY) {
  console.error('[ERROR CRÍTICO] DEEPSEEK_API_KEY no está configurada en las variables de entorno');
}
if (!DEEPSEEK_API_URL) {
  console.error('[ERROR CRÍTICO] DEEPSEEK_API_URL no está configurada en las variables de entorno');
}

/**
 * Traduce un texto al idioma especificado usando la API de DeepSeek
 * @param text Texto a traducir
 * @param targetLang Código del idioma destino (ej. 'en', 'fr')
 * @param originalLang Código del idioma original (por defecto 'es')
 * @returns Texto traducido
 */
export async function translateText(
  text: string,
  targetLang: string,
  originalLang: string = 'es'
): Promise<string> {
  // Si el idioma destino es el mismo que el original, devolver el texto sin cambios
  if (targetLang === originalLang || !targetLang) {
    return text;
  }

  // Generar clave para caché
  const cacheKey = `translate:${targetLang}:${text}`;

  try {
    // Intentar obtener de caché si Redis está conectado
    if (redisConnected) {
      try {
        const cachedTranslation = await redisClient.get(cacheKey);
        if (cachedTranslation) {
          console.log(`[CACHE HIT] Traducción encontrada en caché para: ${text.substring(0, 30)}...`);
          return cachedTranslation;
        }
      } catch (redisError) {
        console.error('Error al acceder a Redis:', redisError);
        // Continuar con la traducción si hay error en Redis
      }
    }

    // Si no hay caché o no está en caché, traducir usando la API
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY no está configurada');
    }

    console.log(`[TRADUCIENDO] Texto: ${text.substring(0, 30)}... a ${targetLang}`);

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `Eres un traductor profesional. Traduce el siguiente texto de ${originalLang} a ${targetLang}. Mantén el formato y solo devuelve el texto traducido sin explicaciones ni comentarios adicionales.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
    });

    const translatedText = completion.choices[0]?.message?.content?.trim() || text;

    // Guardar en caché si Redis está conectado
    if (redisConnected) {
      try {
        await redisClient.set(cacheKey, translatedText, {
          EX: 60 * 60 * 24 * 30, // 30 días
        });
        console.log(`[CACHE SAVE] Traducción guardada en caché para: ${text.substring(0, 30)}...`);
      } catch (redisError) {
        console.error('Error al guardar en Redis:', redisError);
        // Continuar sin caché si hay error
      }
    }

    return translatedText;
  } catch (error) {
    console.error('Error en la traducción:', error);
    return text; // Devolver texto original en caso de error
  }
}
