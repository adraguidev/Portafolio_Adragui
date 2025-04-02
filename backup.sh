#!/bin/bash

# Script para realizar copias de seguridad del portfolio

# Colores para mensajes
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

# Verificar parámetros
if [ "$1" != "backup" ] && [ "$1" != "restore" ]; then
  echo "Uso: $0 backup|restore [ruta_del_archivo]"
  echo "  backup:  Crear una copia de seguridad"
  echo "  restore: Restaurar desde una copia de seguridad"
  exit 1
fi

# Obtener valores de .env
if [ -f .env ]; then
  source <(grep -v '^#' .env | sed -E 's|^(.+)=(.*)$|export \1="\2"|g')
else
  print_error "Archivo .env no encontrado. Por favor, crea este archivo con la configuración de la base de datos."
  exit 1
fi

# Extraer datos de conexión de DATABASE_URL
if [ -n "$DATABASE_URL" ]; then
  # Formateo: postgresql://usuario:contraseña@host:puerto/basededatos
  DB_USER=$(echo $DATABASE_URL | sed -n 's|^postgresql://\([^:]*\):.*|\1|p')
  DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's|^postgresql://[^:]*:\([^@]*\)@.*|\1|p')
  DB_HOST=$(echo $DATABASE_URL | sed -n 's|^postgresql://[^@]*@\([^:]*\):.*|\1|p')
  DB_PORT=$(echo $DATABASE_URL | sed -n 's|^postgresql://[^@]*@[^:]*:\([^/]*\)/.*|\1|p')
  DB_NAME=$(echo $DATABASE_URL | sed -n 's|^postgresql://[^@]*@[^/]*/\(.*\)|\1|p')
else
  print_error "Variable DATABASE_URL no encontrada en .env"
  exit 1
fi

# Verificar que pg_dump y psql están instalados
if ! command -v pg_dump &> /dev/null || ! command -v psql &> /dev/null; then
  print_error "pg_dump y/o psql no encontrados. Por favor, instala PostgreSQL."
  exit 1
fi

# Fecha actual para el nombre del archivo
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR
mkdir -p $BACKUP_DIR/uploads

# Función para hacer backup
do_backup() {
  BACKUP_FILE="${2:-$BACKUP_DIR/portfolio_backup_$DATE.tar.gz}"
  
  print_message "Iniciando copia de seguridad..."
  
  # Backup de la base de datos
  print_message "Creando dump de la base de datos..."
  PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -F c -b -v -f "$BACKUP_DIR/db_backup.dump"
  
  if [ $? -ne 0 ]; then
    print_error "Error al crear el dump de la base de datos."
    exit 1
  fi
  
  # Backup de archivos subidos
  print_message "Copiando archivos subidos..."
  cp -r ./uploads/* $BACKUP_DIR/uploads/
  
  # Compresión del backup
  print_message "Comprimiendo archivos..."
  tar -czf "$BACKUP_FILE" -C $BACKUP_DIR db_backup.dump uploads
  
  # Limpieza de archivos temporales
  rm -f "$BACKUP_DIR/db_backup.dump"
  rm -rf "$BACKUP_DIR/uploads/*"
  
  print_success "Copia de seguridad creada en: $BACKUP_FILE"
}

# Función para restaurar
do_restore() {
  if [ -z "$2" ]; then
    print_error "Debes especificar el archivo de backup: $0 restore ruta/al/archivo.tar.gz"
    exit 1
  fi
  
  RESTORE_FILE="$2"
  
  if [ ! -f "$RESTORE_FILE" ]; then
    print_error "El archivo de backup no existe: $RESTORE_FILE"
    exit 1
  fi
  
  print_message "Iniciando restauración desde $RESTORE_FILE..."
  
  # Crear directorio temporal
  TEMP_DIR="./temp_restore"
  mkdir -p $TEMP_DIR
  
  # Extraer el archivo de backup
  print_message "Extrayendo archivos de backup..."
  tar -xzf "$RESTORE_FILE" -C $TEMP_DIR
  
  if [ ! -f "$TEMP_DIR/db_backup.dump" ]; then
    print_error "Archivo de backup de base de datos no encontrado en el archivo."
    rm -rf $TEMP_DIR
    exit 1
  fi
  
  # Restaurar base de datos
  print_message "Restaurando base de datos..."
  PGPASSWORD=$DB_PASSWORD pg_restore -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --clean --if-exists "$TEMP_DIR/db_backup.dump"
  
  if [ $? -ne 0 ]; then
    print_error "Error al restaurar la base de datos."
    rm -rf $TEMP_DIR
    exit 1
  fi
  
  # Restaurar archivos subidos
  if [ -d "$TEMP_DIR/uploads" ]; then
    print_message "Restaurando archivos subidos..."
    cp -r $TEMP_DIR/uploads/* ./uploads/
  fi
  
  # Limpieza
  rm -rf $TEMP_DIR
  
  print_success "Restauración completada."
}

# Ejecutar la función correspondiente
if [ "$1" = "backup" ]; then
  do_backup "$@"
elif [ "$1" = "restore" ]; then
  do_restore "$@"
fi