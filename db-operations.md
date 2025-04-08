# Guía de Operaciones de Base de Datos para Heroku

Este documento proporciona instrucciones para exportar, importar y administrar la base de datos PostgreSQL de tu aplicación en Heroku.

## Prerequisitos

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) instalado
- Node.js instalado (versión 14 o superior)
- Acceso a la aplicación en Heroku

## 1. Exportar la Base de Datos Local

Para exportar tu base de datos local a un archivo JSON, sigue estos pasos:

1. Instala las dependencias necesarias:

```bash
npm install dotenv pg
```

2. Ejecuta el script de exportación:

```bash
node db-export.js
```

Este script:
- Se conectará a tu base de datos local usando la variable de entorno `DATABASE_URL`.
- Exportará todas las tablas a un archivo JSON en la carpeta `backups`.
- Generará un archivo completo y una versión ligera (con contenido de artículos truncado).

## 2. Importar la Base de Datos a Heroku

### 2.1 Usando el Script de Importación

1. Asegúrate de estar logueado en Heroku CLI:

```bash
heroku login
```

2. Ejecuta el script de importación:

```bash
node db-import-heroku.js [ruta-al-archivo-json]
```

Si no especificas un archivo, el script usará automáticamente el backup más reciente.

3. Sigue las instrucciones en pantalla:
   - Introduce el nombre de tu aplicación en Heroku
   - Confirma que deseas continuar con la importación

El script:
- Obtendrá la URL de la base de datos desde Heroku
- Mostrará una lista de las tablas y registros a importar
- Ejecutará la importación dentro de una transacción para garantizar la integridad de los datos
- Revertirá todos los cambios en caso de error

### 2.2 Usando Heroku PG Restore (Método Alternativo para Backups más Grandes)

Para bases de datos más grandes, puedes usar el método de exportación/importación nativo de Heroku:

1. Exporta un dump de la base de datos local:

```bash
pg_dump -Fc --no-acl --no-owner -h localhost -U tu_usuario tu_database > db_backup.dump
```

2. Importa el dump a Heroku:

```bash
heroku pg:backups:restore 'https://url-publica-al-dump.dump' DATABASE_URL --app nombre-de-tu-app
```

O utilizando un archivo local:

```bash
cat db_backup.dump | heroku pg:psql --app nombre-de-tu-app
```

## 3. Restaurar desde un Backup de Heroku

Si necesitas restaurar la base de datos desde un backup creado por Heroku:

1. Lista los backups disponibles:

```bash
heroku pg:backups --app nombre-de-tu-app
```

2. Restaura un backup específico:

```bash
heroku pg:backups:restore b101 DATABASE_URL --app nombre-de-tu-app
```

Donde `b101` es el ID del backup que deseas restaurar.

## 4. Comandos Útiles para la Administración de la Base de Datos

### 4.1 Conectarse a la Base de Datos de Heroku

```bash
heroku pg:psql --app nombre-de-tu-app
```

### 4.2 Ver Estadísticas de la Base de Datos

```bash
heroku pg:info --app nombre-de-tu-app
```

### 4.3 Resetear la Base de Datos (¡Uso con Precaución!)

```bash
heroku pg:reset DATABASE_URL --app nombre-de-tu-app
```

### 4.4 Crear un Backup Manual en Heroku

```bash
heroku pg:backups:capture --app nombre-de-tu-app
```

### 4.5 Descargar un Backup desde Heroku

```bash
heroku pg:backups:download --app nombre-de-tu-app
```

## 5. Resolución de Problemas

### 5.1 Error "Relation Does Not Exist"

Si recibes errores indicando que ciertas tablas no existen, es posible que el esquema de la base de datos en Heroku sea diferente. Asegúrate de que las migraciones se han ejecutado correctamente.

Puedes inicializar el esquema con:

```bash
heroku run node -e "require('./server/db').initializeDatabase()" --app nombre-de-tu-app
```

### 5.2 Error de Conexión

Si no puedes conectarte a la base de datos, verifica:

1. Que estás logueado en Heroku CLI
2. Que la aplicación existe y tiene una base de datos PostgreSQL conectada
3. Que tienes los permisos adecuados para acceder a la aplicación

### 5.3 Error "Too Many Connections"

Si recibes este error, es posible que haya demasiadas conexiones abiertas a la base de datos. Considera:

1. Cerrar manualmente las conexiones desde la consola de Heroku
2. Reiniciar la aplicación para liberar conexiones: `heroku ps:restart --app nombre-de-tu-app`
3. Revisar tu código para detectar posibles fugas de conexiones

## Notas Importantes

- Heroku tiene límites en el tamaño de la base de datos según el plan que estés utilizando
- Los backups en Heroku pueden expirar; considera descargarlos para almacenamiento a largo plazo
- Siempre haz un backup antes de realizar operaciones importantes en la base de datos
- Las operaciones de importación/exportación pueden tardar varios minutos para bases de datos grandes