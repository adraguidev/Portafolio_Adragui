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
  'alt',
  'title',
  'description',
  'keywords',
  'og:image',
  'twitter:image',
  'favicon',
  'icon',
  'logo',
  'thumbnail',
  'cover',
  'background',
  'avatar',
  'profile',
  'banner',
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
      if (shouldTranslateField(key) && typeof value === 'string') {
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
const SUPPORTED_LANGUAGES = ['en', 'fr', 'de', 'it', 'pt', 'es'];

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
  const originalJson = res.json.bind(res);

  // Sobrescribir res.json para interceptar la respuesta
  res.json = function (body: any) {
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
        return res.json(translatedBody);
      })
      .catch(error => {
        console.log(`[TRANSLATE] ❌ Error al traducir respuesta: ${error}`);
        // En caso de error, restaurar el método original y enviar la respuesta sin traducir
        res.json = originalJson;
        return res.json(body);
      });

    return res;
  };

  next();
}
