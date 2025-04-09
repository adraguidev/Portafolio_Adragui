import { createClient } from 'redis';
import OpenAI from 'openai';

// Configuración de Redis para caché
const redisClient = createClient({
  url: process.env.REDISCLOUD_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      console.log(`[Redis] Intentando reconectar (intento ${retries})...`);
      return Math.min(retries * 100, 3000);
    }
  }
});

// Conexión a Redis
let redisConnected = false;

redisClient
  .connect()
  .then(() => {
    redisConnected = true;
    console.log('[Redis] Conexión exitosa a Redis');
  })
  .catch((err) => {
    console.error('[Redis] Error conectando a Redis:', err);
    console.warn(
      '[Redis] Continuando sin caché Redis. Las traducciones no serán cacheadas.'
    );
    redisConnected = false;
  });

// Agregar listeners para eventos de Redis
redisClient.on('error', (err) => {
  console.error('[Redis] Error en la conexión:', err);
  redisConnected = false;
});

redisClient.on('connect', () => {
  console.log('[Redis] Conectado a Redis');
  redisConnected = true;
});

redisClient.on('reconnecting', () => {
  console.log('[Redis] Reconectando a Redis...');
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

// Cola de traducciones pendientes para procesamiento por lotes
type TranslationRequest = {
  text: string;
  targetLang: string;
  originalLang: string;
  resolve: (value: string) => void;
  reject: (reason?: any) => void;
};

const translationQueue: Record<string, TranslationRequest[]> = {};
let translationTimer: NodeJS.Timeout | null = null;
const BATCH_DELAY = 200; // ms de espera para agrupar traducciones
const MAX_BATCH_SIZE = 10; // máximo de traducciones por lote

/**
 * Procesa un lote de traducciones del mismo idioma de origen al mismo idioma destino
 * @param langPair Código de idioma de origen a destino (ej. "es:en")
 */
async function processBatch(langPair: string) {
  const queue = translationQueue[langPair];
  if (!queue || queue.length === 0) return;

  // Tomar hasta MAX_BATCH_SIZE elementos de la cola
  const batch = queue.splice(0, MAX_BATCH_SIZE);
  const [originalLang, targetLang] = langPair.split(':');

  try {
    // Verificar primero la caché para todos los textos del lote
    if (redisConnected && redisClient.isOpen) {
      const cachePromises = batch.map(async (request) => {
        const cacheKey = `translate:${request.targetLang}:${request.text}`;
        const cachedTranslation = await redisClient.get(cacheKey);
        if (cachedTranslation) {
          request.resolve(cachedTranslation);
          return true; // Indica que se encontró en caché
        }
        return false; // No se encontró en caché
      });

      const cacheResults = await Promise.all(cachePromises);
      // Filtrar solo las solicitudes que no se encontraron en caché
      const uncachedRequests = batch.filter((_, index) => !cacheResults[index]);
      
      // Si todas las solicitudes se encontraron en caché, terminar
      if (uncachedRequests.length === 0) {
        return;
      }
      
      // Continuar solo con las solicitudes no cacheadas
      const texts = uncachedRequests.map(req => req.text);
      
      // Si hay textos para traducir
      if (texts.length > 0) {
        // Preparar mensaje de sistema para traducción por lotes
        const systemContent = `Eres un traductor profesional. Traduce los siguientes textos de ${originalLang} a ${targetLang}. 
Mantén el formato original y devuelve SOLO las traducciones separadas por ###, en el mismo orden en que se presentan, sin numeración ni comentarios adicionales.`;

        // Unir textos con separador para la petición
        const userContent = texts.join('\n###\n');
        
        // Realizar una única llamada a la API para todo el lote
        const completion = await openai.chat.completions.create({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemContent },
            { role: 'user', content: userContent }
          ],
          temperature: 0.3,
        });

        // Dividir la respuesta en traducciones individuales
        const translatedContent = completion.choices[0]?.message.content?.trim() || '';
        const translatedTexts = translatedContent.split('###').map(t => t.trim());
        
        // Asegurar que tenemos el mismo número de traducciones que textos originales
        if (translatedTexts.length >= texts.length) {
          // Guardar en caché y resolver promesas
          for (let i = 0; i < uncachedRequests.length; i++) {
            const request = uncachedRequests[i];
            const translatedText = translatedTexts[i];
            
            // Guardar en caché
            if (redisConnected && redisClient.isOpen) {
              const cacheKey = `translate:${request.targetLang}:${request.text}`;
              await redisClient.set(cacheKey, translatedText, {
                EX: 60 * 60 * 24 * 30, // 30 días
              });
            }
            
            // Resolver la promesa
            request.resolve(translatedText);
          }
        } else {
          // Si no hay suficientes traducciones, rechazar todas las promesas
          throw new Error(`Error en la traducción por lotes: recibidas ${translatedTexts.length} traducciones para ${texts.length} textos`);
        }
      }
    } else {
      // Si no hay Redis, traducir uno a uno
      for (const request of batch) {
        try {
          const result = await translateSingle(
            request.text,
            request.targetLang,
            request.originalLang
          );
          request.resolve(result);
        } catch (error) {
          request.reject(error);
        }
      }
    }
  } catch (error) {
    console.error(`Error procesando lote de traducciones ${langPair}:`, error);
    // En caso de error, rechazar todas las promesas en el lote
    for (const request of batch) {
      request.reject(error);
    }
  }
  
  // Si quedan elementos en la cola, procesar el siguiente lote
  if (translationQueue[langPair].length > 0) {
    processBatch(langPair);
  }
}

/**
 * Método de respaldo para traducir un solo texto (se usa cuando no se puede usar procesamiento por lotes)
 */
async function translateSingle(
  text: string,
  targetLang: string,
  originalLang: string = 'es'
): Promise<string> {
  try {
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

    return completion.choices[0]?.message.content?.trim() || text;
  } catch (error) {
    console.error('Error traduciendo texto único:', error);
    return text; // Devolver texto original en caso de error
  }
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

  // Verificar si es un string vacío o muy corto
  if (text.trim().length <= 1) {
    return text;
  }

  // Generar clave para caché
  const cacheKey = `translate:${targetLang}:${text}`;

  try {
    // Intentar obtener de caché si Redis está conectado
    if (redisConnected && redisClient.isOpen) {
      try {
        const cachedTranslation = await redisClient.get(cacheKey);
        if (cachedTranslation) {
          console.log(`[Redis] Traducción encontrada en caché para: ${text.substring(0, 30)}...`);
          return cachedTranslation;
        }
      } catch (cacheError) {
        console.error('[Redis] Error al acceder a la caché:', cacheError);
        // Continuar con la traducción si hay error en la caché
      }
    }

    // Si no hay caché o no está en caché, intentar traducción por lotes
    return new Promise((resolve, reject) => {
      const langPair = `${originalLang}:${targetLang}`;
      
      // Inicializar la cola si no existe
      if (!translationQueue[langPair]) {
        translationQueue[langPair] = [];
      }
      
      // Añadir solicitud a la cola
      translationQueue[langPair].push({
        text,
        targetLang,
        originalLang,
        resolve,
        reject
      });
      
      // Configurar temporizador para procesar el lote
      if (translationTimer) {
        clearTimeout(translationTimer);
      }
      
      translationTimer = setTimeout(() => {
        // Procesar todos los lotes pendientes
        Object.keys(translationQueue).forEach(key => {
          if (translationQueue[key].length > 0) {
            processBatch(key);
          }
        });
        translationTimer = null;
      }, BATCH_DELAY);
    });
  } catch (error) {
    console.error('[Translate] Error en la traducción:', error);
    return text; // Devolver texto original en caso de error
  }
}
