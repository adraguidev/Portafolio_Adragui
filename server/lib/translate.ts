import { createClient } from 'redis';

// Configuración de Redis para caché
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Conexión a Redis
redisClient.connect().catch((err) => {
  console.error('Error conectando a Redis:', err);
  console.warn(
    'Continuando sin caché Redis. Las traducciones no serán cacheadas.'
  );
});

// Configuración de la API de DeepSeek (compatible con OpenAI)
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL ||
  'https://api.deepseek.com/v1/chat/completions';

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
    if (redisClient.isOpen) {
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
      console.error(
        '[ERROR] DEEPSEEK_API_KEY no está configurada en las variables de entorno de Heroku'
      );
      throw new Error('DEEPSEEK_API_KEY no está configurada');
    }

    console.log('[DEBUG] DEEPSEEK_API_KEY configurada:', !!DEEPSEEK_API_KEY);

    console.log(
      `[TRADUCIENDO] Texto: ${text.substring(0, 30)}... a ${targetLang}`
    );

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
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
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[ERROR] Respuesta de la API DeepSeek:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });
      throw new Error(
        `Error en la API DeepSeek: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content.trim();

    // Guardar en caché si Redis está conectado
    if (redisClient.isOpen) {
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
    return text; // Devolver texto original en caso de error
  }
}
