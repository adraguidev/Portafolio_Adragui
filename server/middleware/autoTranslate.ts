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
];

/**
 * Verifica si un campo debe ser traducido basado en su nombre
 * @param fieldName Nombre del campo
 * @returns true si el campo debe ser traducido, false en caso contrario
 */
function shouldTranslateField(fieldName: string): boolean {
  // No traducir campos en la lista de no traducibles
  if (UNTRANSLATABLE_FIELDS.includes(fieldName)) return false;

  // No traducir campos que terminen con 'Id', 'At', etc.
  if (/^(id|.*Id|.*At|.*_at|.*_id)$/i.test(fieldName)) return false;

  return true;
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
  // Si el idioma destino es el mismo que el original, devolver los datos sin cambios
  if (targetLang === originalLang || !targetLang) {
    return data;
  }

  // Caso base: si es un string, traducirlo
  if (typeof data === 'string') {
    // Verificar si es un string vacío o muy corto
    if (data.trim().length <= 1) {
      return data;
    }
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
      if (shouldTranslateField(key) && typeof value === 'string') {
        // Verificar si es un string vacío o muy corto
        if (value.trim().length <= 1) {
          translatedObject[key] = value;
          continue;
        }
        // Traducir strings en campos traducibles
        translatedObject[key] = await translateText(
          value,
          targetLang,
          originalLang
        );
      } else if (typeof value === 'object' && value !== null) {
        // Procesar recursivamente objetos y arrays
        translatedObject[key] = await translateData(
          value,
          targetLang,
          originalLang
        );
      } else {
        // Mantener otros valores sin cambios
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
  // Obtener el idioma solicitado de la consulta o del header Accept-Language
  const queryLang = req.query.lang as string;
  const acceptLang = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
  const targetLang = queryLang || acceptLang || 'es';
  const originalLang = 'es'; // Idioma original (por ahora fijo en español)

  // Si la ruta es /api/translations/status, no aplicar traducción
  if (req.path === '/api/translations/status') {
    return next();
  }

  console.log(
    `[TRANSLATE] Solicitud de traducción recibida - Path: ${req.path}, Lang: ${targetLang}`
  );

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
      // Traducir el cuerpo de la respuesta
      const translatedBody = await translateData(
        body,
        targetLang,
        originalLang
      );

      // Restaurar el método original y enviar la respuesta traducida
      res.json = originalJson;
      return res.json(translatedBody);
    } catch (error) {
      console.log(`[TRANSLATE] ❌ Error al traducir respuesta: ${error}`);

      // En caso de error, restaurar el método original y enviar la respuesta sin traducir
      res.json = originalJson;
      return res.json(body);
    }
  };

  next();
}
