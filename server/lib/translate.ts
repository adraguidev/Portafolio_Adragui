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

/**
 * Verifica si el texto contiene términos técnicos que no deberían traducirse
 * @param text Texto a verificar
 * @returns true si el texto parece ser un término técnico
 */
function isTechnicalTerm(text: string): boolean {
  // Verificar si es un solo término (sin espacios o con pocos espacios)
  const words = text.split(/\s+/).filter(word => word.length > 0);
  
  // Características de términos técnicos
  const technicalPatterns = [
    // Términos con camelCase o PascalCase
    /^[a-z]+([A-Z][a-z0-9]+)+$/,
    // Términos con guiones bajos o guiones
    /^[a-zA-Z0-9]+[-_][a-zA-Z0-9]+$/,
    // Términos con números y letras mezclados
    /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]+$/,
    // Términos con puntos (como en nombres de bibliotecas)
    /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/,
    // Términos que comienzan con símbolos especiales como @, #, $
    /^[@#$][a-zA-Z0-9]+$/,
    // Palabras en mayúsculas (posibles siglas)
    /^[A-Z]{2,}$/,
  ];

  // Verificar si alguna palabra coincide con patrones técnicos
  for (const word of words) {
    if (technicalPatterns.some(pattern => pattern.test(word))) {
      return true;
    }
  }

  // Lista de palabras que suelen aparecer en términos técnicos
  const technicalWords = [
    'api', 'app', 'backend', 'frontend', 'dev', 'framework', 'lib', 'sdk', 
    'npm', 'ui', 'ux', 'cli', 'css', 'git', 'html', 'js', 'php', 'sql', 'ts', 
    'web', 'json', 'xml', 'yaml', 'yml'
  ];

  // Verificar si alguna palabra es un término técnico común
  for (const word of words) {
    const lowerWord = word.toLowerCase();
    if (technicalWords.includes(lowerWord)) {
      return true;
    }
  }

  return false;
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

  // Si el texto parece ser un término técnico, no traducirlo
  if (isTechnicalTerm(text)) {
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
3. NO traduzcas palabras clave de programación o tecnologías (HTML, CSS, React, Node.js, Angular, Vue, JavaScript, TypeScript, etc.)
4. NO traduzcas nombres de frameworks, bibliotecas, herramientas, o plataformas de tecnología
5. NO traduzcas términos técnicos de desarrollo web o software (backend, frontend, API, SDK, UI, UX, etc.)
6. NO traduzcas siglas o acrónimos técnicos (HTTP, REST, JSON, XML, SQL, etc.)
7. Cualquier palabra que parezca un término de tecnología, lenguaje de programación o herramienta DEBE permanecer en su forma original
8. NO añadas explicaciones ni comentarios adicionales
9. NO modifiques el formato del texto (mantén saltos de línea, espacios, etc.)
10. Mantén el mismo tono y estilo del texto original
11. Si hay alguna parte que no estás seguro de cómo traducir, déjala en el idioma original

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

/**
 * Obtiene información sobre las claves de caché de traducción en Redis
 * @returns Un objeto con información sobre los idiomas y conteo de traducciones
 */
export async function getCacheInfo(): Promise<{
  languages: { [key: string]: number };
  totalKeys: number;
  connected: boolean;
}> {
  if (!redisConnected || !redisClient.isOpen) {
    return {
      languages: {},
      totalKeys: 0,
      connected: false
    };
  }

  try {
    // Obtener todas las claves que comienzan con "translate:"
    const keys = await redisClient.keys('translate:*');
    const totalKeys = keys.length;
    
    // Agrupar por idioma (el formato es translate:[lang]:[text])
    const languages: { [key: string]: number } = {};
    
    for (const key of keys) {
      const parts = key.split(':');
      if (parts.length >= 2) {
        const lang = parts[1];
        languages[lang] = (languages[lang] || 0) + 1;
      }
    }
    
    return {
      languages,
      totalKeys,
      connected: true
    };
  } catch (error) {
    console.error('Error obteniendo información de caché:', error);
    return {
      languages: {},
      totalKeys: 0,
      connected: redisConnected && redisClient.isOpen
    };
  }
}

/**
 * Elimina todas las traducciones en caché para un idioma específico
 * @param lang Código del idioma a limpiar (ej. 'en', 'fr')
 * @returns Número de claves eliminadas
 */
export async function clearCacheByLanguage(lang: string): Promise<{ 
  deleted: number; 
  success: boolean;
  message?: string;
}> {
  if (!redisConnected || !redisClient.isOpen) {
    return { 
      deleted: 0, 
      success: false,
      message: 'Redis no está conectado' 
    };
  }

  try {
    // Patrón para buscar todas las claves del idioma específico
    const pattern = `translate:${lang}:*`;
    const keys = await redisClient.keys(pattern);
    
    if (keys.length === 0) {
      return { 
        deleted: 0, 
        success: true,
        message: `No hay traducciones en caché para ${lang}` 
      };
    }
    
    // Eliminar todas las claves encontradas
    const deleted = await redisClient.del(keys);
    
    return { 
      deleted, 
      success: true,
      message: `Se eliminaron ${deleted} traducciones en caché para ${lang}`
    };
  } catch (error) {
    console.error(`Error eliminando caché para ${lang}:`, error);
    return { 
      deleted: 0, 
      success: false,
      message: `Error eliminando caché para ${lang}: ${(error as Error).message}`
    };
  }
}

/**
 * Elimina todas las traducciones en caché
 * @returns Número de claves eliminadas
 */
export async function clearAllCache(): Promise<{ 
  deleted: number; 
  success: boolean;
  message?: string;
}> {
  if (!redisConnected || !redisClient.isOpen) {
    return { 
      deleted: 0, 
      success: false,
      message: 'Redis no está conectado' 
    };
  }

  try {
    // Obtener todas las claves de traducción
    const keys = await redisClient.keys('translate:*');
    
    if (keys.length === 0) {
      return { 
        deleted: 0, 
        success: true,
        message: 'No hay traducciones en caché' 
      };
    }
    
    // Eliminar todas las claves encontradas
    const deleted = await redisClient.del(keys);
    
    return { 
      deleted, 
      success: true,
      message: `Se eliminaron ${deleted} traducciones en caché`
    };
  } catch (error) {
    console.error('Error eliminando todas las traducciones en caché:', error);
    return { 
      deleted: 0, 
      success: false,
      message: `Error eliminando caché: ${(error as Error).message}`
    };
  }
}
