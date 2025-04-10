import { Request, Response, NextFunction } from 'express';
import { translateText } from '../lib/translate';

// Lista de campos que no deben ser traducidos
const UNTRANSLATABLE_FIELDS = [
  'id',
  'slug',
  'created_at',
  'updated_at',
  'email',
  'password',
  'url',
  'image',
  'file',
  'path',
  'token',
  'uuid',
  'href',
  'src',
  'userId',
  'projectId',
  'experienceId',
  'educationId',
  'skillId',
  'date',
  'startDate',
  'endDate',
  'year',
  'years',
  'month',
  'months',
  'day',
  'days',
  'time',
  'timestamp',
  'name',
  'phone',
  'website',
  'address',
  'code',
  'github',
  'linkedin',
  'twitter',
  'facebook',
  'instagram',
  'youtube',
  'url_*',
  'link_*',
  '*_url',
  '*_link',
  'current',
  'present',
  'now',
  'fromDate',
  'toDate',
  'duration',
];

/**
 * Verifica si un campo debe ser traducido basado en su nombre
 * @param fieldName Nombre del campo
 * @returns true si el campo debe ser traducido, false en caso contrario
 */
function shouldTranslateField(fieldName: string): boolean {
  // No traducir campos en la lista de no traducibles
  if (UNTRANSLATABLE_FIELDS.some(pattern => {
    if (pattern.includes('*')) {
      // Para patrones con comodín
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      return regex.test(fieldName);
    }
    return fieldName === pattern;
  })) return false;

  // No traducir campos que terminen con 'Id', 'At', etc.
  if (/^(id|.*Id|.*At|.*_at|.*_id|.*Date|.*Year|.*Month|.*Time)$/i.test(fieldName)) return false;

  return true;
}

/**
 * Función para verificar si un texto es una URL o ruta de archivo
 * @param text Texto a verificar
 * @returns true si el texto es una URL o ruta de archivo
 */
function isUrlOrFilePath(text: string): boolean {
  // Patrones para detectar URLs y rutas de archivo
  const urlPatterns = [
    /^https?:\/\//i, // URLs HTTP/HTTPS
    /^\/[^/]/, // Rutas absolutas que comienzan con /
    /^\.\.?\//, // Rutas relativas que comienzan con ./ o ../
    /^[a-zA-Z]:\\/, // Rutas de Windows
    /^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|gif|svg|webp|ico|pdf|doc|docx|xls|xlsx)$/i, // Nombres de archivo con extensiones comunes
    /^data:image\/[^;]+;base64,/, // Imágenes en base64
    /^blob:/, // URLs de blob
  ];

  return urlPatterns.some(pattern => pattern.test(text));
}

/**
 * Función para verificar si un texto contiene un formato de fecha o número que no debe traducirse
 * @param text Texto a verificar
 * @returns true si el texto contiene un formato que no debe traducirse
 */
function containsUntranslatableFormat(text: string): boolean {
  // Verificar si es una URL o ruta de archivo
  if (isUrlOrFilePath(text)) {
    return true;
  }

  // Verificar si el texto parece una fecha o contiene patrones de fecha
  const datePatterns = [
    /\d{1,4}[-/\.]\d{1,2}[-/\.]\d{1,4}/,  // Formato fecha como 2021-01-01, 01/01/2021
    /\b\d{4}\s*[-–—]\s*\d{4}\b/i, // Año - Año (sin incluir "actual")
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b/i, // Mes Año en inglés
    /\b(?:Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)[a-z]* \d{4}\b/i, // Mes Año en español
    /\b\d{1,2} (?:de )?(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(?: de)? \d{4}\b/i, // Formato fecha en español
    /\b\d{1,2}(?:st|nd|rd|th)? (?:of )?(?:January|February|March|April|May|June|July|August|September|October|November|December),? \d{4}\b/i, // Formato fecha en inglés
  ];

  // Verificar si el texto contiene algún patrón de fecha
  return datePatterns.some(pattern => pattern.test(text));
}

/**
 * Función que verifica si un texto parece ser un término técnico de programación
 * @param text Texto a verificar
 * @returns true si el texto parece ser un término técnico
 */
function isTechnicalTerm(text: string): boolean {
  // Lista de términos técnicos comunes
  const technicalTerms = [
    // Lenguajes y tecnologías
    'html', 'css', 'javascript', 'js', 'typescript', 'ts', 'java', 'python', 'ruby', 'php', 'c#', 
    'c++', 'swift', 'kotlin', 'go', 'rust', 'sql', 'nosql', 'graphql', 'api',
    
    // Frameworks y bibliotecas
    'react', 'angular', 'vue', 'svelte', 'node', 'express', 'next.js', 'nuxt',
    'django', 'flask', 'spring', 'laravel', 'rails', 'jquery', 'bootstrap',
    'tailwind', 'material-ui', 'chakra', 'redux', 'mobx', 'vuex', 'pinia',
    
    // Herramientas y plataformas
    'git', 'github', 'gitlab', 'bitbucket', 'aws', 'azure', 'gcp', 'firebase',
    'docker', 'kubernetes', 'jenkins', 'ci/cd', 'vscode', 'intellij', 'webpack',
    'babel', 'eslint', 'jest', 'mocha', 'cypress', 'selenium', 'postman',
    
    // Conceptos
    'frontend', 'backend', 'fullstack', 'devops', 'ui', 'ux', 'seo', 'pwa',
    'rest', 'soap', 'http', 'https', 'jwt', 'oauth', 'api', 'sdk', 'cli',
    'mvc', 'orm', 'crud', 'ajax', 'json', 'xml', 'yaml', 'markdown', 'npm', 'yarn'
  ];
  
  const lowercaseText = text.toLowerCase();
  
  // Verificar si coincide exactamente o es parte de una palabra técnica
  return technicalTerms.some(term => 
    lowercaseText === term || 
    lowercaseText.includes(term) ||
    // Detectar versiones (React 18, Node.js 16, etc.)
    lowercaseText.match(new RegExp(`\\b${term}\\s+\\d+`)) ||
    // Detectar términos con .js, .py, etc.
    lowercaseText.match(new RegExp(`\\b${term}\\.[a-z]+\\b`))
  );
}

/**
 * Traduce recursivamente todos los valores string en un objeto o array
 * @param data Datos a traducir (objeto, array o valor primitivo)
 * @param targetLang Idioma destino
 * @param originalLang Idioma original
 * @returns Datos traducidos
 */
async function translateData(
  data: any,
  targetLang: string,
  originalLang: string = 'es'
): Promise<any> {
  if (typeof data === 'string') {
    if (containsUntranslatableFormat(data) || isTechnicalTerm(data)) {
      return data;
    }
    // Intentar traducir siempre si no está en el caché
    return await translateText(data, targetLang, originalLang);
  }

  if (Array.isArray(data)) {
    const translatedArray = [];
    for (const item of data) {
      translatedArray.push(await translateData(item, targetLang, originalLang));
    }
    return translatedArray;
  }

  if (data !== null && typeof data === 'object') {
    const translatedObject: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      // Tratamiento especial para arrays de skills
      if (key === 'items' && Array.isArray(value) && 
          data.category && typeof data.category === 'string') {
        // Si encontramos un objeto con una categoría y un array de items, 
        // probablemente sea un grupo de skills técnicos
        translatedObject[key] = value.map(item => 
          typeof item === 'string' && isTechnicalTerm(item) 
            ? item // Si es un término técnico, preservarlo
            : typeof item === 'string' 
              ? translateText(item, targetLang, originalLang) 
              : translateData(item, targetLang, originalLang)
        );
        
        // Como los items son promesas debido a translateText, debemos esperar a que se resuelvan
        translatedObject[key] = await Promise.all(translatedObject[key]);
      } else if (shouldTranslateField(key) && typeof value === 'string' && !containsUntranslatableFormat(value) && !isTechnicalTerm(value)) {
        translatedObject[key] = await translateText(
          value,
          targetLang,
          originalLang
        );
      } else if (typeof value === 'object' && value !== null) {
        translatedObject[key] = await translateData(
          value,
          targetLang,
          originalLang
        );
      } else {
        translatedObject[key] = value;
      }
    }

    return translatedObject;
  }

  return data;
}

/**
 * Middleware para traducir automáticamente las respuestas JSON
 * @param req Request de Express
 * @param res Response de Express
 * @param next Función next de Express
 */
// Lista de idiomas soportados
const SUPPORTED_LANGUAGES = ['en', 'fr', 'de', 'it', 'pt', 'es', 'ja', 'zh'];

export function autoTranslateMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Obtener el idioma solicitado de la consulta
  const targetLang = (req.query.lang as string)?.toLowerCase();
  const originalLang = 'es'; // Idioma original (por ahora fijo en español)

  console.log(
    `[TRANSLATE] Solicitud de traducción recibida - Path: ${req.path}, Lang: ${targetLang}`
  );

  // Si no hay parámetro de idioma, no traducir
  if (!req.query.lang) {
    console.log(
      '[TRANSLATE] ℹ️ No se solicitó traducción (sin parámetro lang)'
    );
    return next();
  }

  // Validar que el idioma solicitado sea válido
  if (!SUPPORTED_LANGUAGES.includes(targetLang)) {
    console.log(
      `[TRANSLATE] ⚠️ Idioma no válido o no soportado: ${targetLang}`
    );
    return next();
  }

  // Si el idioma es el mismo que el original, continuar sin modificar
  if (targetLang === originalLang) {
    console.log('[TRANSLATE] ℹ️ Idioma solicitado es el mismo que el original');
    return next();
  }

  console.log(
    `[TRANSLATE] ✅ Iniciando traducción de ${originalLang} a ${targetLang}`
  );

  // Guardar la función original res.json
  const originalJson = res.json;

  // Sobrescribir res.json para interceptar la respuesta
  res.json = async function (body: any) {
    try {
      const translatedBody = await translateData(body, targetLang, originalLang);
      res.json = originalJson;
      return originalJson.call(this, translatedBody);
    } catch (error) {
      console.log(`[TRANSLATE] ❌ Error al traducir respuesta: ${error}`);
      res.json = originalJson;
      return originalJson.call(this, body);
    }
  };

  next();
}
