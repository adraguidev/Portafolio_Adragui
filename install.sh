#!/bin/bash

# Script de instalación para el Portfolio Personal
# Este script automatiza la instalación y configuración de la aplicación en un nuevo servidor

# Colores para salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
print_message() {
  echo -e "${BLUE}[INFO] $1${NC}"
}

print_success() {
  echo -e "${GREEN}[SUCCESS] $1${NC}"
}

print_error() {
  echo -e "${RED}[ERROR] $1${NC}"
}

# Verificar que se está ejecutando como sudo
if [ "$EUID" -ne 0 ]; then
  print_error "Por favor ejecuta este script con sudo: sudo ./install.sh"
  exit 1
fi

# Preguntar información de la base de datos
read -p "Nombre de base de datos [portfolio_db]: " db_name
db_name=${db_name:-portfolio_db}

read -p "Usuario de base de datos [portfolio_user]: " db_user
db_user=${db_user:-portfolio_user}

read -s -p "Contraseña de base de datos: " db_password
echo ""

read -p "Puerto para la aplicación [5000]: " app_port
app_port=${app_port:-5000}

# Verificar dependencias
print_message "Verificando dependencias..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
  print_message "Node.js no encontrado. Instalando..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  print_success "Node.js instalado correctamente."
else
  node_version=$(node -v)
  print_success "Node.js ya está instalado: $node_version"
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
  print_error "NPM no encontrado. Por favor instala NPM manualmente."
  exit 1
else
  npm_version=$(npm -v)
  print_success "NPM ya está instalado: $npm_version"
fi

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
  print_message "PostgreSQL no encontrado. Instalando..."
  apt-get update
  apt-get install -y postgresql postgresql-contrib
  print_success "PostgreSQL instalado correctamente."
else
  psql_version=$(psql --version)
  print_success "PostgreSQL ya está instalado: $psql_version"
fi

# Iniciar PostgreSQL si no está activo
systemctl status postgresql > /dev/null 2>&1
if [ $? -ne 0 ]; then
  print_message "Iniciando PostgreSQL..."
  systemctl start postgresql
  systemctl enable postgresql
  print_success "PostgreSQL iniciado correctamente."
fi

# Crear usuario y base de datos
print_message "Configurando la base de datos PostgreSQL..."
su - postgres -c "psql -c \"CREATE USER $db_user WITH PASSWORD '$db_password';\""
su - postgres -c "psql -c \"CREATE DATABASE $db_name OWNER $db_user;\""
su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE $db_name TO $db_user;\""
print_success "Base de datos configurada correctamente."

# Crear directorio para la aplicación
app_dir="/opt/portfolio"
print_message "Creando directorio de la aplicación en $app_dir..."
mkdir -p $app_dir
cd $app_dir

# Clonar el repositorio o copiar los archivos
if [ -f "/tmp/portfolio.tar.gz" ]; then
  print_message "Extrayendo archivos desde /tmp/portfolio.tar.gz..."
  tar -xzf /tmp/portfolio.tar.gz -C $app_dir
else
  print_message "No se encontró archivo comprimido. Por favor clona o copia manualmente el repositorio en $app_dir"
  print_message "Luego ejecuta el resto de la configuración manualmente según el README.md"
  exit 1
fi

# Instalar dependencias
print_message "Instalando dependencias..."
cd $app_dir
npm install
print_success "Dependencias instaladas correctamente."

# Configurar variables de entorno
print_message "Configurando variables de entorno..."

# Generar claves secretas aleatorias
jwt_secret=$(openssl rand -hex 32)
session_secret=$(openssl rand -hex 32)

cat > $app_dir/.env << EOL
DATABASE_URL=postgresql://$db_user:$db_password@localhost:5432/$db_name
JWT_SECRET=$jwt_secret
SESSION_SECRET=$session_secret
PORT=$app_port
NODE_ENV=production
EOL

print_success "Variables de entorno configuradas correctamente."

# Crear directorio para uploads
print_message "Configurando directorio de uploads..."
mkdir -p $app_dir/uploads
chmod 755 $app_dir/uploads
print_success "Directorio de uploads configurado."

# Aplicar esquema de base de datos
print_message "Aplicando esquema de base de datos..."
cd $app_dir
npm run db:push
print_success "Esquema de base de datos aplicado correctamente."

# Construir la aplicación para producción
print_message "Construyendo la aplicación para producción..."
npm run build
print_success "Aplicación construida correctamente."

# Configurar servicio systemd
print_message "Configurando servicio systemd..."
cat > /etc/systemd/system/portfolio.service << EOL
[Unit]
Description=Servicio de Portfolio Personal
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$app_dir
ExecStart=/usr/bin/npm run start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOL

systemctl daemon-reload
systemctl enable portfolio.service
systemctl start portfolio.service
print_success "Servicio systemd configurado y iniciado."

# Configurar Nginx (si está instalado)
if command -v nginx &> /dev/null; then
  print_message "Configurando Nginx..."
  
  cat > /etc/nginx/sites-available/portfolio << EOL
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:$app_port;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /uploads/ {
        alias $app_dir/uploads/;
    }
}
EOL

  ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
  nginx -t && systemctl restart nginx
  print_success "Nginx configurado correctamente."
fi

print_success "¡Instalación completada!"
echo -e "${GREEN}La aplicación está disponible en http://localhost:$app_port${NC}"
echo -e "${GREEN}Credenciales de administrador:${NC}"
echo -e "${GREEN}  Email: admin@example.com${NC}"
echo -e "${GREEN}  Contraseña: admin123${NC}"
echo -e "${BLUE}Se recomienda cambiar estas credenciales después del primer inicio de sesión.${NC}"