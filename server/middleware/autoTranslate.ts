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

  // Verificar si el texto es un timestamp ISO o similar
  if (text.includes('T') && (text.includes('Z') || text.includes('+'))) {
    return true;
  }

  // Verificar si el texto parece una fecha o contiene patrones de fecha
  const datePatterns = [
    /\d{4}-\d{2}-\d{2}/, // ISO date format YYYY-MM-DD
    /\d{1,4}[-/\.]\d{1,2}[-/\.]\d{1,4}/,  // Formato fecha como 2021-01-01, 01/01/2021
    /\b\d{4}\s*[-–—]\s*\d{4}\b/i, // Año - Año (sin incluir "actual")
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/i, // Mes día, Año en inglés
    /\b(?:Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)[a-z]* \d{1,2}(?:,| de)? \d{4}\b/i, // Mes día, Año en español
    /\b\d{1,2} (?:de )?(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(?: de)? \d{4}\b/i, // Formato fecha en español
    /\b\d{1,2}(?:st|nd|rd|th)? (?:of )?(?:January|February|March|April|May|June|July|August|September|October|November|December),? \d{4}\b/i, // Formato fecha en inglés
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2},? \d{4}\b/i, // Mes día, Año en inglés
    /\b(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) \d{1,2}(?:,| de)? \d{4}\b/i, // Mes día, Año en español
  ];

  // Verificar si el texto contiene algún patrón de fecha
  if (datePatterns.some(pattern => pattern.test(text))) {
    return true;
  }

  // Verificar si es un objeto Date serializado
  try {
    const possibleDate = new Date(text);
    if (!isNaN(possibleDate.getTime())) {
      return true;
    }
  } catch (e) {
    // No es una fecha válida, continuar con la verificación
  }

  return false;
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
    // Preservar fechas y formatos especiales
    if (containsUntranslatableFormat(data)) {
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
      // Preservar campos de fecha específicos
      if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) {
        translatedObject[key] = value;
        continue;
      }

      if (shouldTranslateField(key)) {
        if (typeof value === 'string' && !containsUntranslatableFormat(value)) {
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
