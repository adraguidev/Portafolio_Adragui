#!/usr/bin/env node

/**
 * Script para exportar la base de datos local a un archivo JSON
 * Este script puede ser ejecutado con: node db-export.js
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const dotenv = require("dotenv");

// Cargar variables de entorno si existe un archivo .env
if (fs.existsSync(".env")) {
  dotenv.config();
}

// Configuración de la base de datos
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
};

// Crear el directorio de backups si no existe
const backupsDir = path.join(__dirname, "backups");
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

// Generar nombre de archivo con fecha
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const filename = path.join(backupsDir, `db-backup-${timestamp}.json`);

// Función para exportar la base de datos
async function exportDatabase() {
  console.log("🔍 Conectando a la base de datos...");

  const pool = new Pool(dbConfig);

  try {
    // Obtener todas las tablas de la base de datos
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name != 'pg_stat_statements'
      AND table_name != 'session'
      ORDER BY table_name;
    `);

    const tables = tablesResult.rows.map((row) => row.table_name);

    console.log(`📊 Encontradas ${tables.length} tablas en la base de datos`);

    // Objeto para almacenar todos los datos
    const databaseData = {};

    // Exportar datos de cada tabla
    for (const table of tables) {
      console.log(`📦 Exportando tabla: ${table}`);

      const dataResult = await pool.query(`SELECT * FROM "${table}"`);
      databaseData[table] = dataResult.rows;

      console.log(
        `✅ Exportados ${dataResult.rows.length} registros de ${table}`,
      );
    }

    // Guardar los datos en un archivo JSON
    fs.writeFileSync(filename, JSON.stringify(databaseData, null, 2));

    console.log(`\n🎉 Exportación completada con éxito!`);
    console.log(`📁 Los datos han sido guardados en: ${filename}`);

    // También crear un archivo de exportación más ligero sin el contenido de los artículos
    const lightExportFilename = path.join(
      backupsDir,
      `db-backup-light-${timestamp}.json`,
    );

    // Hacer una copia profunda de los datos
    const lightData = JSON.parse(JSON.stringify(databaseData));

    // Simplificar contenido de artículos para reducir tamaño
    if (lightData.articles) {
      lightData.articles.forEach((article) => {
        if (article.content && article.content.length > 200) {
          article.content =
            article.content.substring(0, 200) + "... [contenido truncado]";
        }
      });
    }

    fs.writeFileSync(lightExportFilename, JSON.stringify(lightData, null, 2));
    console.log(`📁 Versión ligera guardada en: ${lightExportFilename}`);
  } catch (error) {
    console.error("❌ Error al exportar la base de datos:", error);
  } finally {
    await pool.end();
  }
}

// Ejecutar la función de exportación
exportDatabase();
