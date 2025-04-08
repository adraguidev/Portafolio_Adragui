#!/bin/bash

# Script para restaurar un archivo .dump de PostgreSQL en Heroku
# Uso: ./restore-heroku.sh [nombre-app-heroku] [ruta-al-archivo-dump]

# Colores para la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin Color

# Verificar si se proporcionó el nombre de la aplicación de Heroku
if [ -z "$1" ]; then
    echo -e "${YELLOW}Por favor, proporciona el nombre de tu aplicación Heroku como primer argumento.${NC}"
    echo -e "Uso: ./restore-heroku.sh [nombre-app-heroku] [ruta-al-archivo-dump]"
    exit 1
fi

APP_NAME="$1"

# Verificar si se proporcionó la ruta al archivo dump
if [ -z "$2" ]; then
    # Si no se proporcionó, buscar el archivo dump más reciente en la carpeta backups
    if [ -d "backups" ]; then
        LATEST_DUMP=$(find backups -name "*.dump" -type f -printf "%T@ %p\n" | sort -nr | head -1 | cut -d' ' -f2-)
        
        if [ -z "$LATEST_DUMP" ]; then
            echo -e "${RED}No se encontró ningún archivo .dump en la carpeta backups.${NC}"
            echo -e "${YELLOW}Por favor, proporciona la ruta al archivo dump como segundo argumento.${NC}"
            echo -e "Uso: ./restore-heroku.sh [nombre-app-heroku] [ruta-al-archivo-dump]"
            exit 1
        else
            DUMP_FILE="$LATEST_DUMP"
            echo -e "${BLUE}Usando el archivo dump más reciente: ${YELLOW}$DUMP_FILE${NC}"
        fi
    else
        echo -e "${RED}No se encontró la carpeta backups.${NC}"
        echo -e "${YELLOW}Por favor, proporciona la ruta al archivo dump como segundo argumento.${NC}"
        echo -e "Uso: ./restore-heroku.sh [nombre-app-heroku] [ruta-al-archivo-dump]"
        exit 1
    fi
else
    DUMP_FILE="$2"
    
    # Verificar si el archivo existe
    if [ ! -f "$DUMP_FILE" ]; then
        echo -e "${RED}El archivo $DUMP_FILE no existe.${NC}"
        exit 1
    fi
fi

# Verificar si el usuario está autenticado en Heroku
heroku whoami &>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${RED}No estás autenticado en Heroku CLI.${NC}"
    echo -e "${YELLOW}Por favor, ejecuta 'heroku login' primero.${NC}"
    exit 1
fi

# Verificar si la aplicación existe en Heroku
heroku apps:info --app "$APP_NAME" &>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${RED}La aplicación '$APP_NAME' no existe o no tienes acceso a ella.${NC}"
    exit 1
fi

echo -e "${BLUE}Verificando si la aplicación $APP_NAME tiene un addon de PostgreSQL...${NC}"
heroku addons:info heroku-postgresql --app "$APP_NAME" &>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${RED}La aplicación no tiene un addon de PostgreSQL configurado.${NC}"
    echo -e "${YELLOW}¿Deseas crear uno ahora? (s/n)${NC}"
    read -p "" CREATE_DB
    
    if [[ "$CREATE_DB" =~ ^[Ss]$ ]]; then
        echo -e "${BLUE}Creando addon de PostgreSQL...${NC}"
        heroku addons:create heroku-postgresql:mini --app "$APP_NAME"
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}Error al crear el addon de PostgreSQL.${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}Addon de PostgreSQL creado correctamente.${NC}"
    else
        echo -e "${YELLOW}Operación cancelada.${NC}"
        exit 1
    fi
fi

# Mostrar advertencia y solicitar confirmación
echo -e "${RED}ADVERTENCIA: Esta operación sobrescribirá TODOS los datos en la base de datos de Heroku.${NC}"
echo -e "${RED}Todos los datos existentes se perderán. Este proceso NO se puede deshacer.${NC}"
echo -e "${YELLOW}¿Estás seguro de que deseas continuar? (s/n)${NC}"
read -p "" CONFIRM

if [[ ! "$CONFIRM" =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}Operación cancelada por el usuario.${NC}"
    exit 1
fi

# Restaurar el dump en Heroku
echo -e "${BLUE}Iniciando la restauración de la base de datos en Heroku...${NC}"
echo -e "${BLUE}Esto puede tardar varios minutos dependiendo del tamaño de la base de datos.${NC}"

if [[ "$DUMP_FILE" == http* ]]; then
    # Si es una URL, usar el comando de restauración directo
    echo -e "${BLUE}Restaurando desde URL...${NC}"
    heroku pg:backups:restore "$DUMP_FILE" DATABASE_URL --app "$APP_NAME" --confirm "$APP_NAME"
else
    # Si es un archivo local, usar el pipe
    echo -e "${BLUE}Restaurando desde archivo local...${NC}"
    heroku pg:reset DATABASE_URL --app "$APP_NAME" --confirm "$APP_NAME"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error al resetear la base de datos.${NC}"
        exit 1
    fi
    
    cat "$DUMP_FILE" | heroku pg:psql --app "$APP_NAME"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error al restaurar la base de datos.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}¡Restauración completada correctamente!${NC}"
echo -e "${BLUE}Puedes verificar el estado de la base de datos con:${NC}"
echo -e "${YELLOW}heroku pg:info --app $APP_NAME${NC}"

# Preguntar si desea reiniciar la aplicación
echo -e "${YELLOW}¿Deseas reiniciar la aplicación para que los cambios surtan efecto? (s/n)${NC}"
read -p "" RESTART

if [[ "$RESTART" =~ ^[Ss]$ ]]; then
    echo -e "${BLUE}Reiniciando la aplicación...${NC}"
    heroku restart --app "$APP_NAME"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Aplicación reiniciada correctamente.${NC}"
    else
        echo -e "${RED}Error al reiniciar la aplicación.${NC}"
    fi
fi

echo -e "${GREEN}¡Proceso completado!${NC}"
