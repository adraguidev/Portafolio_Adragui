import { createClient } from 'redis';
import OpenAI from 'openai';

// Configuración de Redis para caché
const redisClient = createClient({
  url: process.env.REDISCLOUD_URL || 'redis://localhost:6379',
});

// Conexión a Redis
let redisConnected = false;

redisClient
  .connect()
  .then(() => {
    redisConnected = true;
    console.log('Conexión exitosa a Redis');
  })
  .catch((err) => {
    console.error('Error conectando a Redis:', err);
    console.warn(
      'Continuando sin caché Redis. Las traducciones no serán cacheadas.'
    );
    redisConnected = false;
  });

// Configuración del cliente OpenAI para DeepSeek
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';

// Inicializar el cliente OpenAI
const openai = new OpenAI({
  baseURL: DEEPSEEK_API_URL,
  apiKey: DEEPSEEK_API_KEY,
});

// Validar la configuración al inicio
if (!DEEPSEEK_API_KEY) {
  console.error(
    '[ERROR CRÍTICO] DEEPSEEK_API_KEY no está configurada en las variables de entorno'
  );
}
if (!DEEPSEEK_API_URL) {
  console.error(
    '[ERROR CRÍTICO] DEEPSEEK_API_URL no está configurada en las variables de entorno'
  );
}

// Lista de términos técnicos que deben mantenerse en inglés cuando se traduce al inglés
const TECHNICAL_TERMS = [
  'Responsive Design',
  'Data Visualization',
  'Machine Learning',
  'Data & Analytics',
  'Tools & Methods',
  'Frontend',
  'Business & Insurance',
  'Customer Success'
];

/**
 * Verifica si un texto contiene términos técnicos que deben mantenerse en inglés
 * @param text Texto a verificar
 * @returns true si el texto contiene términos técnicos
 */
function containsTechnicalTerm(text: string): boolean {
  return TECHNICAL_TERMS.some(term => text.includes(term));
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

  // Si el idioma destino es inglés y el texto contiene términos técnicos, mantener el texto original
  if (targetLang === 'en' && containsTechnicalTerm(text)) {
    return text;
  }

  // Generar clave para caché
  const cacheKey = `translate:${targetLang}:${text}`;

  try {
    // Intentar obtener de caché si Redis está conectado
    if (redisConnected && redisClient.isOpen) {
      const cachedTranslation = await redisClient.get(cacheKey);
      if (cachedTranslation) {
        console.log(
          `[CACHE HIT] Traducción encontrada en caché para: ${text.substring(
            0,
            30
          )}...`
        );
        return cachedTranslation;
      }
    }

    // Si no hay caché o no está en caché, traducir usando la API
    if (!DEEPSEEK_API_KEY) {
      const error = new Error('DEEPSEEK_API_KEY no está configurada');
      console.error('[ERROR] No se puede traducir:', error);
      throw error;
    }

    console.log('[DEBUG] Iniciando traducción con DeepSeek API');
    console.log('[DEBUG] Texto a traducir:', text.substring(0, 100));
    console.log('[DEBUG] Idioma destino:', targetLang);

    console.log('[DEBUG] DEEPSEEK_API_KEY configurada:', !!DEEPSEEK_API_KEY);
    console.log('[DEBUG] DEEPSEEK_API_URL:', DEEPSEEK_API_URL);

    console.log(
      `[TRADUCIENDO] Texto: ${text.substring(0, 30)}... a ${targetLang}`
    );

    try {
      const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Eres un traductor profesional especializado en traducir contenido web. Traduce el siguiente texto de ${originalLang} a ${targetLang}. 

REGLAS IMPORTANTES:
1. NO traduzcas fechas, años, números, URLs, nombres propios, marcas, o términos técnicos
2. NO traduzcas expresiones como "2019 - actual", "2020 - presente", etc.
3. NO traduzcas palabras clave de programación o tecnologías (HTML, CSS, React, etc.)
4. NO añadas explicaciones ni comentarios adicionales
5. NO modifiques el formato del texto (mantén saltos de línea, espacios, etc.)
6. Mantén el mismo tono y estilo del texto original
7. Si hay alguna parte que no estás seguro de cómo traducir, déjala en el idioma original

Devuelve ÚNICAMENTE el texto traducido sin ninguna explicación.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.2,
      });

      const translatedText = completion?.choices[0]?.message?.content?.trim() || text;

      // Guardar en caché si Redis está conectado
      if (redisConnected && redisClient.isOpen) {
        await redisClient.set(cacheKey, translatedText, {
          EX: 60 * 60 * 24 * 30, // 30 días
        });
        console.log(
          `[CACHE SAVE] Traducción guardada en caché para: ${text.substring(
            0,
            30
          )}...`
        );
      }

      return translatedText;
    } catch (error) {
      console.error('Error al traducir texto:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en la traducción:', error);
    return text; // Devolver texto original en caso de error
  } finally {
    // Asegurar que cualquier recurso se libere adecuadamente
    if (!redisClient.isOpen) {
      console.log('[DEBUG] Redis no está conectado, no es necesario cerrar');
    }
  }
}
