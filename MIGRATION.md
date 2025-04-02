# Guía de Migración del Portfolio

Esta guía proporciona instrucciones detalladas para migrar el portfolio a diferentes entornos de hosting.

## Tabla de Contenidos

1. [Preparación para la Migración](#preparación-para-la-migración)
2. [Migración a un Servidor VPS (Ubuntu/Debian)](#migración-a-un-servidor-vps-ubuntudebian)
3. [Migración a Heroku](#migración-a-heroku)
4. [Migración a Render](#migración-a-render)
5. [Migración a Railway](#migración-a-railway)
6. [Solución de Problemas Comunes](#solución-de-problemas-comunes)

## Preparación para la Migración

Antes de migrar el portfolio a cualquier plataforma, debes:

1. **Realizar una copia de seguridad completa**:
   ```bash
   ./backup.sh backup
   ```

2. **Exportar los datos** desde el panel de administración:
   - Accede a `/admin` y navega a "Configuración"
   - Usa la opción "Exportar datos" y guarda el archivo JSON

3. **Recopilar todos los archivos necesarios**:
   - Todo el código fuente del proyecto
   - La carpeta `uploads/` con los archivos subidos
   - El archivo de backup generado
   - El archivo JSON de exportación de datos

## Migración a un Servidor VPS (Ubuntu/Debian)

### 1. Configuración Inicial del Servidor

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias necesarias
sudo apt install -y curl wget git build-essential postgresql postgresql-contrib nginx

# Instalar Node.js v20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Configurar PostgreSQL

```bash
# Crear usuario y base de datos
sudo -u postgres psql -c "CREATE USER portfolio_user WITH PASSWORD 'tu_contraseña';"
sudo -u postgres psql -c "CREATE DATABASE portfolio_db OWNER portfolio_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;"
```

### 3. Instalar la Aplicación

```bash
# Crear directorio para la aplicación
sudo mkdir -p /var/www/portfolio
sudo chown -R $USER:$USER /var/www/portfolio

# Clonar el repositorio o transferir los archivos
cd /var/www/portfolio
# Si usas git:
git clone <url-del-repositorio> .
# O descomprime un archivo:
tar -xzf portfolio.tar.gz

# Instalar dependencias
npm install

# Configurar variables de entorno
cat > .env << EOL
DATABASE_URL=postgresql://portfolio_user:tu_contraseña@localhost:5432/portfolio_db
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
PORT=5000
EOL

# Aplicar el esquema de la base de datos
npm run db:push

# Crear directorio para archivos subidos
mkdir -p uploads
chmod 755 uploads

# Construir la aplicación
npm run build
```

### 4. Configurar PM2 para Gestión de Procesos

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar la aplicación con PM2
cd /var/www/portfolio
pm2 start npm --name "portfolio" -- run start

# Configurar inicio automático
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
pm2 save
```

### 5. Configurar Nginx como Proxy Inverso

```bash
# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/portfolio

# Añadir la siguiente configuración:
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
        alias /var/www/portfolio/uploads/;
    }
}

# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Configurar SSL con Certbot (Opcional pero Recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tudominio.com

# Verificar la renovación automática
sudo systemctl status certbot.timer
```

### 7. Restaurar los Datos (Opcional)

```bash
# Si tienes un archivo de backup
./backup.sh restore ruta/al/archivo/backup.tar.gz

# O importar desde el panel de administración:
# 1. Accede a /admin
# 2. Ve a "Configuración" -> "Importar Datos"
# 3. Sube el archivo JSON exportado previamente
```

## Migración a Heroku

### 1. Preparación del Proyecto

```bash
# Instalar Heroku CLI
npm install -g heroku

# Iniciar sesión en Heroku
heroku login

# Crear una aplicación en Heroku
heroku create tu-portfolio

# Añadir complemento PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Configurar variables de entorno
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
heroku config:set SESSION_SECRET=$(openssl rand -hex 32)
heroku config:set NODE_ENV=production
```

### 2. Actualizar Configuración para Heroku

Debes modificar el archivo `package.json` para añadir un script de inicio:

```json
"scripts": {
  "start": "node server/index.js",
  "build": "vite build",
  "heroku-postbuild": "npm run build"
}
```

### 3. Configuración para Archivos Estáticos

Crea un archivo `Procfile` en la raíz:

```
web: npm start
```

### 4. Desplegar en Heroku

```bash
# Inicializar git si no lo has hecho
git init
git add .
git commit -m "Initial commit for Heroku"

# Añadir remoto de Heroku
heroku git:remote -a tu-portfolio

# Desplegar
git push heroku main
```

### 5. Migrate la Base de Datos

```bash
heroku run npm run db:push
```

### 6. Importar Datos

Deberás usar el panel de administración para importar los datos:
1. Accede a tu aplicación en `https://tu-portfolio.herokuapp.com/admin`
2. Ve a "Configuración" -> "Importar Datos"
3. Sube el archivo JSON exportado previamente

**Nota:** Heroku tiene un sistema de archivos efímero, lo que significa que los archivos subidos (como imágenes) no persistirán después de reinicios. Deberás utilizar un servicio de almacenamiento externo como Amazon S3.

## Migración a Render

### 1. Preparar el Proyecto

Crea un archivo `render.yaml` en la raíz del proyecto:

```yaml
services:
  - type: web
    name: portfolio
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: SESSION_SECRET
        generateValue: true
      - key: DATABASE_URL
        fromDatabase:
          name: portfolio-db
          property: connectionString

databases:
  - name: portfolio-db
    databaseName: portfolio
    user: portfolio_user
```

### 2. Configurar los Scripts

Asegúrate de que el `package.json` tenga los scripts necesarios:

```json
"scripts": {
  "start": "node server/index.js",
  "build": "vite build",
  "db:push": "drizzle-kit push:pg"
}
```

### 3. Desplegar en Render

1. Crea una cuenta en [Render](https://render.com)
2. Conecta tu repositorio Git
3. Selecciona "Blueprint" como tipo de deploye y selecciona el archivo `render.yaml`
4. Sigue las instrucciones para completar el despliegue

### 4. Configurar Almacenamiento Persistente

Para los archivos subidos, deberás usar Render Disks o un servicio de almacenamiento externo.

## Migración a Railway

### 1. Preparación

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Iniciar sesión
railway login
```

### 2. Configurar el Proyecto

```bash
# Inicializar proyecto
railway init

# Añadir servicio PostgreSQL
railway add
```

### 3. Configurar Variables de Entorno

Desde el Dashboard de Railway:
1. Ve a "Variables"
2. Añade:
   - `JWT_SECRET`
   - `SESSION_SECRET`
   - `NODE_ENV=production`

### 4. Desplegar

```bash
railway up
```

## Solución de Problemas Comunes

### Problemas con la Base de Datos

1. **Error "role portfolio_user does not exist"**:
   - Verifica que has creado el usuario correctamente en PostgreSQL.
   - Ejecuta: `sudo -u postgres psql -c "CREATE USER portfolio_user WITH PASSWORD 'tu_contraseña';"`

2. **Error de conexión a la base de datos**:
   - Verifica la URL de conexión: `postgresql://usuario:contraseña@host:puerto/basededatos`
   - Asegúrate de que PostgreSQL esté en ejecución: `sudo systemctl status postgresql`

### Problemas con los Archivos Subidos

1. **Las imágenes no se muestran**:
   - Verifica los permisos del directorio `uploads/`: `chmod 755 uploads/`
   - Confirma que la ruta estática está configurada correctamente en Nginx o el servidor web

2. **Error al subir archivos**:
   - Verifica que el directorio `uploads/` existe y tiene permisos de escritura
   - Comprueba los límites de tamaño en la configuración de Multer

### Problemas con el Despliegue

1. **Error "npm ERR! missing script: start"**:
   - Asegúrate de que el archivo `package.json` tiene un script `start` definido

2. **Error "Port already in use"**:
   - Cambia el puerto en la variable de entorno `PORT` o cierra la aplicación que está usando ese puerto

3. **Error "EACCES: permission denied"**:
   - Verifica los permisos de los directorios: `chown -R $USER:$USER /ruta/a/tu/aplicacion`