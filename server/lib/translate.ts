import { createClient } from 'redis';
import OpenAI from 'openai';
import pMap from 'p-map';

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

// Configuración de rendimiento para traducciones
const MAX_CONCURRENT_REQUESTS = 3; // Número máximo de solicitudes simultáneas
const MAX_RETRIES = 2; // Número máximo de reintentos si falla una traducción
const TRANSLATION_TIMEOUT = 8000; // Tiempo máximo de espera para una traducción (ms)

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

  // Si el texto es muy corto, no merece la pena la sobrecarga de la API
  if (text.length < 5) {
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

    console.log(
      `[TRADUCIENDO] Texto: ${text.substring(0, 30)}... a ${targetLang}`
    );

    // Implementar timeout para evitar que las traducciones se queden esperando indefinidamente
    const translationPromise = new Promise<string>(async (resolve, reject) => {
      let retries = 0;
      let lastError: Error | null = null;

      while (retries <= MAX_RETRIES) {
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
            // Añadir un max_tokens para acelerar la respuesta si es posible
            max_tokens: Math.min(text.length * 2, 2000), // Estimación aproximada
          });

          const translatedText = completion.choices[0].message.content?.trim() || '';
          resolve(translatedText);
          return;
        } catch (error: any) {
          lastError = error;
          retries++;
          console.error(`Intento ${retries}/${MAX_RETRIES + 1} falló:`, error.message);
          
          // Esperar un poco antes de reintentar (backoff exponencial)
          if (retries <= MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 200 * Math.pow(2, retries)));
          }
        }
      }
      
      // Si llegamos aquí, todos los intentos fallaron
      reject(lastError || new Error('Falló la traducción después de varios intentos'));
    });

    // Aplicar timeout
    const translatedText = await Promise.race([
      translationPromise,
      new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout en traducción')), TRANSLATION_TIMEOUT)
      )
    ]).catch(error => {
      console.error('Error o timeout en traducción:', error.message);
      return text; // Devolver texto original en caso de timeout
    });

    // Guardar en caché si Redis está conectado y la traducción fue exitosa
    if (redisConnected && redisClient.isOpen && translatedText !== text) {
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
    console.error('Error en la traducción:', error);
    return text; // Devolver texto original en caso de error
  }
}

// Exportar función para traducir fragmentos grandes de texto dividiendo en partes más pequeñas
export async function translateLargeText(
  text: string,
  targetLang: string,
  originalLang: string = 'es'
): Promise<string> {
  // Si es texto corto, usar la traducción normal
  if (text.length < 1000) {
    return translateText(text, targetLang, originalLang);
  }

  // Dividir el texto en párrafos
  const paragraphs = text.split(/\n\n+/);
  
  // Traducir párrafos en paralelo con límite de concurrencia
  const translatedParagraphs = await pMap(
    paragraphs,
    async (paragraph: string) => translateText(paragraph, targetLang, originalLang),
    { concurrency: MAX_CONCURRENT_REQUESTS }
  );
  
  // Unir los párrafos traducidos
  return translatedParagraphs.join('\n\n');
}
