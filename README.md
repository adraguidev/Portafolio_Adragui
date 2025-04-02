# Portfolio Personal de Adrián Aguirre

Este es un sitio web de portfolio profesional moderno y bilingüe con integración de base de datos PostgreSQL, que ofrece una presentación dinámica e interactiva del trabajo profesional a través de un panel de administración robusto y una interfaz pública atractiva.

![Imagen del portfolio](/attached_assets/image_1743611218724.png)

## Tabla de Contenidos

1. [Características](#características)
2. [Tecnologías](#tecnologías)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Requisitos del Sistema](#requisitos-del-sistema)
5. [Instalación](#instalación)
6. [Configuración](#configuración)
7. [Migración a Otro Servidor](#migración-a-otro-servidor)
8. [Base de Datos](#base-de-datos)
9. [Administración del Sitio](#administración-del-sitio)
10. [Personalización](#personalización)
11. [Solución de Problemas](#solución-de-problemas)
12. [Licencia](#licencia)

## Características

- **Diseño Responsivo y Bilingüe**: Interfaz completamente traducida al español con soporte para visualización en múltiples dispositivos.
- **Panel de Administración**: Gestión completa del contenido del portfolio, incluyendo proyectos, experiencia, educación, habilidades y artículos.
- **Sistema de Autenticación**: Autenticación segura con JWT para acceder al panel de administración.
- **Sección de Portada Personalizable**: Posibilidad de personalizar la imagen del hero desde el panel de administración.
- **Gestión de CV**: Carga y descarga del currículum vitae en formato PDF.
- **Blog Integrado**: Sistema de blog con artículos publicados/borrador y categorías.
- **Formulario de Contacto**: Sistema de mensajes con notificaciones en el panel de administración.
- **Sección de Proyectos**: Presentación de proyectos destacados con imágenes y tecnologías utilizadas.
- **Exportación/Importación de Datos**: Funcionalidad para respaldar y restaurar todos los datos del sitio.

## Tecnologías

- **Frontend**:
  - React (TypeScript)
  - Tailwind CSS
  - Framer Motion para animaciones
  - shadcn/ui para componentes de interfaz
  - TanStack Query para gestión de estado y fetching de datos

- **Backend**:
  - Node.js con Express
  - PostgreSQL para base de datos
  - Drizzle ORM para interactuar con la base de datos
  - JWT para autenticación
  - Multer para carga de archivos

## Estructura del Proyecto

```
├── client/                # Código del frontend
│   ├── src/
│   │   ├── components/    # Componentes React reutilizables
│   │   ├── hooks/         # Hooks personalizados
│   │   ├── lib/           # Utilidades y configuraciones
│   │   ├── pages/         # Páginas de la aplicación
│   │   └── ...
├── server/                # Código del backend
│   ├── routes.ts          # Definición de rutas API
│   ├── storage.ts         # Capa de acceso a datos
│   ├── db.ts              # Configuración de la base de datos
│   └── ...
├── shared/                # Código compartido entre cliente y servidor
│   └── schema.ts          # Esquema de la base de datos
├── uploads/               # Directorio para archivos subidos
├── drizzle.config.ts      # Configuración de Drizzle ORM
└── ...
```

## Requisitos del Sistema

- Node.js v20.x o superior
- PostgreSQL v15.x o superior
- NPM v9.x o superior
- Al menos 1GB de RAM y 10GB de espacio en disco

## Instalación

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd portfolio-adrian
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/portfolio_db
JWT_SECRET=tu_clave_secreta_jwt
SESSION_SECRET=tu_clave_secreta_sesion
```

### 4. Configurar la Base de Datos

```bash
# Crear la base de datos en PostgreSQL
createdb portfolio_db

# Aplicar el esquema de la base de datos
npm run db:push
```

### 5. Iniciar la Aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5000`.

## Configuración

### Configuración de la Base de Datos

La configuración de la base de datos se encuentra en `server/db.ts`. Utiliza la variable de entorno `DATABASE_URL` para la conexión.

### Configuración de JWT

Las claves JWT se configuran en `server/routes.ts`. Asegúrate de configurar un valor seguro para `JWT_SECRET` en el archivo `.env`.

### Configuración de Carga de Archivos

La configuración para cargar archivos (CV e imágenes) se encuentra en `server/routes.ts`. Por defecto, los archivos se guardan en el directorio `uploads/`.

## Migración a Otro Servidor

### Script de Migración Automática

Para facilitar la migración a un nuevo servidor, puedes utilizar el siguiente script. Crea un archivo llamado `migrate.sh` en la raíz del proyecto:

```bash
#!/bin/bash

# Crear directorio de instalación
echo "Creando directorio de instalación..."
mkdir -p portfolio_site
cd portfolio_site

# Clonar repositorio
echo "Clonando repositorio..."
git clone <url-del-repositorio> .

# Instalar dependencias
echo "Instalando dependencias..."
npm install

# Configurar variables de entorno
echo "Configurando variables de entorno..."
cat > .env << EOL
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/portfolio_db
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
EOL

# Crear base de datos PostgreSQL
echo "Configurando base de datos..."
sudo -u postgres psql -c "CREATE USER portfolio_user WITH PASSWORD 'tu_contraseña';"
sudo -u postgres psql -c "CREATE DATABASE portfolio_db OWNER portfolio_user;"

# Migrar esquema de base de datos
echo "Migrando esquema de base de datos..."
npm run db:push

# Crear directorio de uploads
echo "Configurando directorio de uploads..."
mkdir -p uploads
chmod 755 uploads

# Configuración de producción
echo "Configurando entorno de producción..."
npm run build

# Instrucciones para PM2
echo "Para iniciar la aplicación con PM2, ejecuta:"
echo "pm2 start npm --name \"portfolio\" -- run start"
```

### Pasos para Migración Manual

1. **Respaldar los Datos**:
   - En el panel de administración, ve a "Configuración" → "Exportar Datos" y descarga el archivo JSON.
   - Respalda la carpeta `uploads/` que contiene los archivos subidos.

2. **Configurar el Nuevo Servidor**:
   - Instala Node.js, NPM y PostgreSQL en el nuevo servidor.
   - Crea una base de datos PostgreSQL para el proyecto.

3. **Clonar e Instalar el Proyecto**:
   - Sigue los pasos 1-4 de la sección de [Instalación](#instalación).

4. **Restaurar los Datos**:
   - Copia la carpeta `uploads/` del servidor anterior al nuevo servidor.
   - Inicia la aplicación y accede al panel de administración.
   - Ve a "Configuración" → "Importar Datos" y sube el archivo JSON descargado previamente.

5. **Configurar PM2 (Recomendado para Producción)**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "portfolio" -- run start
   pm2 startup
   pm2 save
   ```

6. **Configurar Nginx (Opcional)**:
   ```nginx
   server {
       listen 80;
       server_name tudominio.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /uploads/ {
           alias /ruta/a/tu/proyecto/uploads/;
       }
   }
   ```

## Base de Datos

### Estructura de la Base de Datos

El esquema de la base de datos está definido en `shared/schema.ts` y contiene las siguientes tablas:

- `users` - Usuarios del sistema (administradores)
- `projects` - Proyectos del portfolio
- `experiences` - Experiencia laboral
- `education` - Formación académica
- `skills` - Habilidades y tecnologías
- `articles` - Artículos del blog
- `messages` - Mensajes de contacto
- `site_info` - Información general del sitio

### Respaldo y Restauración

Para respaldar y restaurar la base de datos, puedes utilizar las herramientas estándar de PostgreSQL:

```bash
# Respaldar
pg_dump -U usuario -d portfolio_db > backup.sql

# Restaurar
psql -U usuario -d portfolio_db < backup.sql
```

También puedes utilizar la funcionalidad de exportación/importación desde el panel de administración para mantener sincronizados los datos entre diferentes entornos.

## Administración del Sitio

### Acceso al Panel de Administración

El panel de administración está disponible en la ruta `/admin`. Las credenciales por defecto son:

- Email: `admin@example.com`
- Contraseña: `admin123`

Se recomienda cambiar estas credenciales después del primer inicio de sesión.

### Gestión de Contenido

Desde el panel de administración puedes gestionar:

- **Proyectos**: Añadir, editar y eliminar proyectos del portfolio.
- **Experiencia**: Gestionar la experiencia laboral.
- **Educación**: Administrar la formación académica.
- **Habilidades**: Organizar habilidades por categorías.
- **Artículos**: Crear y publicar artículos en el blog.
- **Mensajes**: Ver y gestionar los mensajes recibidos a través del formulario de contacto.
- **Configuración**: Personalizar la información del sitio, imagen de hero, y gestionar el CV.

## Personalización

### Apariencia Visual

El tema visual se configura en `theme.json` en la raíz del proyecto. Puedes ajustar:

- `primary`: El color principal del sitio.
- `variant`: El estilo de variación de color ('professional', 'tint', 'vibrant').
- `appearance`: El modo de visualización ('light', 'dark', 'system').
- `radius`: El radio de bordes para elementos UI.

### Estilos CSS

Los estilos principales están definidos con Tailwind CSS. Puedes personalizar la configuración en `tailwind.config.ts`.

### Componentes

Los componentes de UI utilizan shadcn/ui, que proporciona una biblioteca de componentes estilizados basados en Radix UI y Tailwind CSS. Puedes personalizarlos modificando los archivos en `client/src/components/ui/`.

## Solución de Problemas

### Problemas Comunes

1. **Error de conexión a la base de datos**:
   - Verifica que PostgreSQL esté funcionando: `sudo service postgresql status`.
   - Comprueba la URL de conexión en el archivo `.env`.
   - Asegúrate de que el usuario tenga permisos suficientes: `GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO usuario;`.

2. **Los archivos subidos no se muestran**:
   - Verifica que el directorio `uploads/` exista y tenga permisos: `chmod 755 uploads`.
   - Comprueba que la ruta estática esté correctamente configurada en `server/routes.ts`.

3. **Errores de autenticación**:
   - Limpia las cookies del navegador e intenta iniciar sesión nuevamente.
   - Verifica que las claves JWT_SECRET y SESSION_SECRET estén correctamente configuradas.

### Registro de Eventos

Los logs del servidor se muestran en la consola durante la ejecución. Para una solución más robusta en producción, considera implementar un sistema de logging como Winston o Pino.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.