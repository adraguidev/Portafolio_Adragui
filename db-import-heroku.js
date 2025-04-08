#!/usr/bin/env node

/**
 * Script para importar datos a una base de datos PostgreSQL en Heroku
 * 
 * Uso: node db-import-heroku.js <ruta-al-archivo-json>
 * 
 * Ejemplo: node db-import-heroku.js ./backups/db-backup-2025-04-08.json
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { exec } = require('child_process');
const readline = require('readline');

// Crear interfaz de línea de comandos
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  white: '\x1b[37m',
};

// Función para mostrar mensajes
const log = {
  info: (msg) => console.log(`${colors.blue}INFO:${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}OK:${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}AVISO:${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}ERROR:${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}\n`)
};

// Función para preguntar al usuario
function pregunta(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Función para obtener la URL de la base de datos de Heroku
async function getHerokuDatabaseUrl(appName) {
  return new Promise((resolve, reject) => {
    exec(`heroku config:get DATABASE_URL --app ${appName}`, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Error al obtener la URL de la base de datos: ${stderr}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// Función para verificar si una tabla existe
async function tableExists(pool, tableName) {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    
    return result.rows[0].exists;
  } catch (error) {
    log.error(`Error al verificar si la tabla ${tableName} existe: ${error.message}`);
    return false;
  }
}

// Función para vaciar una tabla
async function truncateTable(pool, tableName) {
  try {
    await pool.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
    log.success(`Tabla ${tableName} vaciada correctamente`);
  } catch (error) {
    log.error(`Error al vaciar la tabla ${tableName}: ${error.message}`);
    throw error;
  }
}

// Función para insertar datos en una tabla
async function insertData(pool, tableName, data) {
  if (!data || data.length === 0) {
    log.warning(`No hay datos para insertar en la tabla ${tableName}`);
    return;
  }
  
  try {
    // Obtener las columnas a partir del primer objeto
    const columns = Object.keys(data[0]).filter(col => col !== 'id');
    
    // Preparar la consulta INSERT
    for (const row of data) {
      const placeholders = [];
      const values = [];
      let i = 1;
      
      // Para cada columna, agregar un placeholder y su valor correspondiente
      for (const col of columns) {
        placeholders.push(`$${i}`);
        values.push(row[col]);
        i++;
      }
      
      // Si hay un id específico, usarlo como valor para la columna id
      let idPart = "";
      let idValuePart = "";
      
      if (row.id) {
        idPart = "id, ";
        idValuePart = `${row.id}, `;
      }
      
      // Construir y ejecutar la consulta
      const query = `
        INSERT INTO "${tableName}" (${idPart}${columns.join(', ')})
        VALUES (${idValuePart}${placeholders.join(', ')})
        ON CONFLICT (id) DO UPDATE SET 
        ${columns.map((col, idx) => `${col} = $${idx + 1}`).join(', ')}
      `;
      
      await pool.query(query, values);
    }
    
    log.success(`${data.length} registros insertados en la tabla ${tableName}`);
  } catch (error) {
    log.error(`Error al insertar datos en la tabla ${tableName}: ${error.message}`);
    throw error;
  }
}

// Función principal para importar los datos
async function importData(dbUrl, jsonFile) {
  log.title('IMPORTANDO DATOS A LA BASE DE DATOS DE HEROKU');
  
  // Validar que el archivo exista
  if (!fs.existsSync(jsonFile)) {
    log.error(`El archivo ${jsonFile} no existe`);
    process.exit(1);
  }
  
  // Cargar los datos desde el archivo JSON
  log.info(`Cargando datos desde ${jsonFile}...`);
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  
  // Obtener todas las tablas
  const tables = Object.keys(data);
  log.info(`Se encontraron ${tables.length} tablas en el archivo JSON`);
  
  // Configurar la conexión a la base de datos
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    // Verificar la conexión a la base de datos
    log.info('Verificando conexión a la base de datos...');
    await pool.query('SELECT NOW()');
    log.success('Conexión a la base de datos establecida correctamente');
    
    // Mostrar información sobre las tablas
    log.info('Tablas a importar:');
    for (const table of tables) {
      const rowCount = data[table].length;
      console.log(`  - ${table}: ${rowCount} registros`);
    }
    
    // Pedir confirmación al usuario
    const confirmacion = await pregunta('\n¿Estás seguro de que deseas importar estos datos? Esta operación sobrescribirá los datos existentes. (s/n): ');
    
    if (confirmacion.toLowerCase() !== 's' && confirmacion.toLowerCase() !== 'si' && confirmacion.toLowerCase() !== 'sí') {
      log.warning('Operación cancelada por el usuario');
      process.exit(0);
    }
    
    // Comenzar la importación
    log.info('Iniciando proceso de importación...');
    
    // Iniciar una transacción
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Para cada tabla, vaciarla y luego insertar los datos
      for (const table of tables) {
        // Verificar si la tabla existe
        const exists = await tableExists(client, table);
        
        if (!exists) {
          log.warning(`La tabla "${table}" no existe en la base de datos. Omitiendo...`);
          continue;
        }
        
        // Vaciar la tabla
        await truncateTable(client, table);
        
        // Insertar los datos
        await insertData(client, table, data[table]);
      }
      
      // Confirmar la transacción
      await client.query('COMMIT');
      log.success('Transacción completada correctamente');
      
    } catch (error) {
      // Revertir la transacción en caso de error
      await client.query('ROLLBACK');
      log.error(`Error durante la importación: ${error.message}`);
      log.info('Se ha revertido la transacción. La base de datos no ha sido modificada.');
      process.exit(1);
    } finally {
      // Liberar el cliente
      client.release();
    }
    
    log.title('IMPORTACIÓN COMPLETADA CON ÉXITO');
    log.info('La base de datos ha sido actualizada correctamente');
    
  } catch (error) {
    log.error(`Error al conectar a la base de datos: ${error.message}`);
    process.exit(1);
  } finally {
    await pool.end();
    rl.close();
  }
}

// Función principal
async function main() {
  try {
    // Obtener el archivo JSON a importar
    let jsonFile = process.argv[2];
    
    // Si no se especificó un archivo, buscar en el directorio de backups
    if (!jsonFile) {
      const backupsDir = path.join(__dirname, 'backups');
      
      if (fs.existsSync(backupsDir)) {
        // Obtener todos los archivos de backup y ordenarlos por fecha (el más reciente primero)
        const files = fs.readdirSync(backupsDir)
          .filter(file => file.startsWith('db-backup-') && file.endsWith('.json'))
          .sort()
          .reverse();
        
        if (files.length > 0) {
          // Usar el archivo más reciente
          jsonFile = path.join(backupsDir, files[0]);
          log.info(`Usando el archivo de backup más reciente: ${files[0]}`);
        }
      }
    }
    
    // Si aún no hay archivo, pedir al usuario
    if (!jsonFile) {
      jsonFile = await pregunta('Introduce la ruta al archivo JSON de backup: ');
    }
    
    // Pedir el nombre de la aplicación Heroku
    const appName = await pregunta('Introduce el nombre de tu aplicación en Heroku: ');
    
    // Obtener la URL de la base de datos
    log.info(`Obteniendo la URL de la base de datos para la aplicación ${appName}...`);
    
    try {
      const dbUrl = await getHerokuDatabaseUrl(appName);
      log.success('URL de la base de datos obtenida correctamente');
      
      // Importar los datos
      await importData(dbUrl, jsonFile);
    } catch (error) {
      log.error(error.message);
      log.info('Asegúrate de estar logueado en Heroku CLI con "heroku login" y que la aplicación exista.');
      process.exit(1);
    }
    
  } catch (error) {
    log.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar la función principal
main();