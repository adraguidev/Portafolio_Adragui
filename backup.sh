#!/bin/bash

# Script para crear un archivo .dump de PostgreSQL para importar a Heroku
# Uso: ./backup.sh

# Colores para la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin Color

# Crear directorio de backups si no existe
mkdir -p backups

# Obtener fecha y hora actual para el nombre del archivo
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
FILENAME="backups/portfolio-db-$TIMESTAMP.dump"

echo -e "${BLUE}Generando backup de PostgreSQL...${NC}"

# Verificar si DATABASE_URL está definido
if [ -z "$DATABASE_URL" ]; then
    # Intentar cargar desde .env si existe
    if [ -f .env ]; then
        source .env
    fi
    
    # Si sigue sin estar definido, preguntar al usuario
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${YELLOW}Variable DATABASE_URL no encontrada.${NC}"
        echo -e "Por favor ingresa los detalles de conexión:"
        read -p "Host (default: localhost): " DB_HOST
        DB_HOST=${DB_HOST:-localhost}
        
        read -p "Puerto (default: 5432): " DB_PORT
        DB_PORT=${DB_PORT:-5432}
        
        read -p "Nombre de la base de datos: " DB_NAME
        
        read -p "Usuario: " DB_USER
        
        read -s -p "Contraseña: " DB_PASS
        echo ""
        
        # Construir la cadena de conexión
        export PGPASSWORD=$DB_PASS
        DB_CONN="-h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME"
    else
        # Extraer componentes de DATABASE_URL
        # Formato esperado: postgres://username:password@hostname:port/database
        DB_USER=$(echo $DATABASE_URL | awk -F '//' '{print $2}' | awk -F ':' '{print $1}')
        DB_PASS=$(echo $DATABASE_URL | awk -F ':' '{print $3}' | awk -F '@' '{print $1}')
        DB_HOST=$(echo $DATABASE_URL | awk -F '@' '{print $2}' | awk -F ':' '{print $1}')
        DB_PORT=$(echo $DATABASE_URL | awk -F ':' '{print $4}' | awk -F '/' '{print $1}')
        DB_NAME=$(echo $DATABASE_URL | awk -F '/' '{print $NF}')
        
        export PGPASSWORD=$DB_PASS
        DB_CONN="-h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME"
    fi
else
    # Si DATABASE_URL está definido como una URL completa, configúrala directamente
    echo -e "${BLUE}Usando DATABASE_URL del entorno...${NC}"
    DB_CONN="$DATABASE_URL"
fi

# Ejecutar pg_dump para crear el backup
echo -e "${BLUE}Ejecutando pg_dump para crear backup...${NC}"
pg_dump -Fc --no-acl --no-owner $DB_CONN > "$FILENAME"

# Verificar si el comando se ejecutó correctamente
if [ $? -eq 0 ]; then
    echo -e "${GREEN}¡Backup completado con éxito!${NC}"
    echo -e "Archivo guardado como: ${YELLOW}$FILENAME${NC}"
    echo ""
    echo -e "${BLUE}Para restaurar este archivo en Heroku, ejecuta:${NC}"
    echo -e "${YELLOW}heroku pg:backups:restore '$PWD/$FILENAME' DATABASE_URL --app TU-APP-HEROKU${NC}"
    echo ""
    echo -e "${BLUE}O si prefieres subirlo manualmente:${NC}"
    echo -e "${YELLOW}cat $FILENAME | heroku pg:psql --app TU-APP-HEROKU${NC}"
else
    echo -e "${RED}Error al crear el backup.${NC}"
    echo -e "${YELLOW}Asegúrate de tener pg_dump instalado y que la conexión a la base de datos sea correcta.${NC}"
    exit 1
fi

# Limpiar variable de entorno de la contraseña
unset PGPASSWORD
