# Documentación de API

Este documento describe las APIs disponibles en el portfolio personal.

## Autenticación

### Iniciar sesión

- **URL:** `/api/auth/login`
- **Método:** `POST`
- **Descripción:** Autenticarse en el sistema
- **Parámetros del cuerpo:**
  - `email` (string, obligatorio): Correo electrónico del usuario
  - `password` (string, obligatorio): Contraseña del usuario
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo:
    ```json
    {
      "token": "jwt_token_string",
      "user": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "admin"
      }
    }
    ```
- **Respuestas de error:**
  - Código: 400 - Datos incompletos
  - Código: 401 - Credenciales inválidas

### Cerrar sesión

- **URL:** `/api/auth/logout`
- **Método:** `POST`
- **Descripción:** Cerrar sesión actual
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo:
    ```json
    {
      "message": "Logged out successfully"
    }
    ```

### Verificar autenticación

- **URL:** `/api/auth/me`
- **Método:** `GET`
- **Descripción:** Obtener información del usuario actualmente autenticado
- **Requiere autenticación:** Sí
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo:
    ```json
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin"
    }
    ```
- **Respuestas de error:**
  - Código: 401 - No autenticado
  - Código: 404 - Usuario no encontrado

## Proyectos

### Obtener todos los proyectos

- **URL:** `/api/projects`
- **Método:** `GET`
- **Descripción:** Obtener lista de todos los proyectos
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Array de objetos de proyecto

### Obtener proyectos destacados

- **URL:** `/api/projects/featured`
- **Método:** `GET`
- **Descripción:** Obtener lista de proyectos destacados
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Array de objetos de proyecto destacados

### Obtener un proyecto específico

- **URL:** `/api/projects/:id`
- **Método:** `GET`
- **Descripción:** Obtener detalles de un proyecto específico
- **Parámetros de URL:**
  - `id` (número): ID del proyecto
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto de proyecto
- **Respuestas de error:**
  - Código: 404 - Proyecto no encontrado

### Crear un proyecto

- **URL:** `/api/projects`
- **Método:** `POST`
- **Descripción:** Crear un nuevo proyecto
- **Requiere autenticación:** Sí
- **Parámetros del cuerpo:**
  - `title` (string, obligatorio): Título del proyecto
  - `description` (string, obligatorio): Descripción del proyecto
  - `imageUrl` (string, opcional): URL de la imagen del proyecto
  - `projectUrl` (string, opcional): URL del proyecto
  - `technologies` (array, opcional): Tecnologías utilizadas
  - `featured` (boolean, opcional): Si es un proyecto destacado
  - `order` (number, opcional): Orden de visualización
- **Respuesta exitosa:**
  - Código: 201
  - Cuerpo: Objeto del proyecto creado
- **Respuestas de error:**
  - Código: 400 - Datos inválidos
  - Código: 401 - No autenticado

### Actualizar un proyecto

- **URL:** `/api/projects/:id`
- **Método:** `PUT`
- **Descripción:** Actualizar un proyecto existente
- **Requiere autenticación:** Sí
- **Parámetros de URL:**
  - `id` (número): ID del proyecto
- **Parámetros del cuerpo:** Campos a actualizar (mismos que en creación)
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto del proyecto actualizado
- **Respuestas de error:**
  - Código: 400 - Datos inválidos
  - Código: 401 - No autenticado
  - Código: 404 - Proyecto no encontrado

### Eliminar un proyecto

- **URL:** `/api/projects/:id`
- **Método:** `DELETE`
- **Descripción:** Eliminar un proyecto
- **Requiere autenticación:** Sí
- **Parámetros de URL:**
  - `id` (número): ID del proyecto
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo:
    ```json
    {
      "message": "Project deleted successfully"
    }
    ```
- **Respuestas de error:**
  - Código: 401 - No autenticado
  - Código: 404 - Proyecto no encontrado

## Experiencia Laboral

### Obtener toda la experiencia laboral

- **URL:** `/api/experiences`
- **Método:** `GET`
- **Descripción:** Obtener lista de toda la experiencia laboral
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Array de objetos de experiencia

### Obtener una experiencia específica

- **URL:** `/api/experiences/:id`
- **Método:** `GET`
- **Descripción:** Obtener detalles de una experiencia específica
- **Parámetros de URL:**
  - `id` (número): ID de la experiencia
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto de experiencia
- **Respuestas de error:**
  - Código: 404 - Experiencia no encontrada

### Crear una experiencia

- **URL:** `/api/experiences`
- **Método:** `POST`
- **Descripción:** Crear una nueva experiencia laboral
- **Requiere autenticación:** Sí
- **Parámetros del cuerpo:**
  - `title` (string, obligatorio): Cargo
  - `company` (string, obligatorio): Empresa
  - `description` (string, obligatorio): Descripción de las responsabilidades
  - `startDate` (string, obligatorio): Fecha de inicio
  - `endDate` (string, opcional): Fecha de finalización
  - `isCurrent` (boolean, opcional): Si es el trabajo actual
  - `order` (number, opcional): Orden de visualización
- **Respuesta exitosa:**
  - Código: 201
  - Cuerpo: Objeto de la experiencia creada
- **Respuestas de error:**
  - Código: 400 - Datos inválidos
  - Código: 401 - No autenticado

### Actualizar una experiencia

- **URL:** `/api/experiences/:id`
- **Método:** `PUT`
- **Descripción:** Actualizar una experiencia existente
- **Requiere autenticación:** Sí
- **Parámetros de URL:**
  - `id` (número): ID de la experiencia
- **Parámetros del cuerpo:** Campos a actualizar (mismos que en creación)
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto de la experiencia actualizada
- **Respuestas de error:**
  - Código: 400 - Datos inválidos
  - Código: 401 - No autenticado
  - Código: 404 - Experiencia no encontrada

### Eliminar una experiencia

- **URL:** `/api/experiences/:id`
- **Método:** `DELETE`
- **Descripción:** Eliminar una experiencia
- **Requiere autenticación:** Sí
- **Parámetros de URL:**
  - `id` (número): ID de la experiencia
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo:
    ```json
    {
      "message": "Experience deleted successfully"
    }
    ```
- **Respuestas de error:**
  - Código: 401 - No autenticado
  - Código: 404 - Experiencia no encontrada

## Educación

### Obtener toda la educación

- **URL:** `/api/education`
- **Método:** `GET`
- **Descripción:** Obtener lista de toda la formación académica
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Array de objetos de educación

### Obtener una educación específica

- **URL:** `/api/education/:id`
- **Método:** `GET`
- **Descripción:** Obtener detalles de una formación académica específica
- **Parámetros de URL:**
  - `id` (número): ID de la educación
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto de educación
- **Respuestas de error:**
  - Código: 404 - Educación no encontrada

### Crear una educación

- **URL:** `/api/education`
- **Método:** `POST`
- **Descripción:** Crear una nueva formación académica
- **Requiere autenticación:** Sí
- **Parámetros del cuerpo:**
  - `institution` (string, obligatorio): Institución educativa
  - `degree` (string, obligatorio): Título obtenido
  - `description` (string, obligatorio): Descripción
  - `startDate` (string, obligatorio): Fecha de inicio
  - `endDate` (string, opcional): Fecha de finalización
  - `order` (number, opcional): Orden de visualización
- **Respuesta exitosa:**
  - Código: 201
  - Cuerpo: Objeto de la educación creada
- **Respuestas de error:**
  - Código: 400 - Datos inválidos
  - Código: 401 - No autenticado

### Actualizar una educación

- **URL:** `/api/education/:id`
- **Método:** `PUT`
- **Descripción:** Actualizar una formación académica existente
- **Requiere autenticación:** Sí
- **Parámetros de URL:**
  - `id` (número): ID de la educación
- **Parámetros del cuerpo:** Campos a actualizar (mismos que en creación)
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto de la educación actualizada
- **Respuestas de error:**
  - Código: 400 - Datos inválidos
  - Código: 401 - No autenticado
  - Código: 404 - Educación no encontrada

### Eliminar una educación

- **URL:** `/api/education/:id`
- **Método:** `DELETE`
- **Descripción:** Eliminar una formación académica
- **Requiere autenticación:** Sí
- **Parámetros de URL:**
  - `id` (número): ID de la educación
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo:
    ```json
    {
      "message": "Education item deleted successfully"
    }
    ```
- **Respuestas de error:**
  - Código: 401 - No autenticado
  - Código: 404 - Educación no encontrada

## Habilidades

### Obtener todas las habilidades

- **URL:** `/api/skills`
- **Método:** `GET`
- **Descripción:** Obtener lista de todas las habilidades
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Array de objetos de habilidad

### Obtener una habilidad específica

- **URL:** `/api/skills/:id`
- **Método:** `GET`
- **Descripción:** Obtener detalles de una habilidad específica
- **Parámetros de URL:**
  - `id` (número): ID de la habilidad
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto de habilidad
- **Respuestas de error:**
  - Código: 404 - Habilidad no encontrada

### Crear una habilidad

- **URL:** `/api/skills`
- **Método:** `POST`
- **Descripción:** Crear una nueva categoría de habilidad
- **Requiere autenticación:** Sí
- **Parámetros del cuerpo:**
  - `category` (string, obligatorio): Categoría de la habilidad
  - `items` (array, obligatorio): Lista de habilidades
  - `order` (number, opcional): Orden de visualización
- **Respuesta exitosa:**
  - Código: 201
  - Cuerpo: Objeto de la habilidad creada
- **Respuestas de error:**
  - Código: 400 - Datos inválidos
  - Código: 401 - No autenticado

### Actualizar una habilidad

- **URL:** `/api/skills/:id`
- **Método:** `PUT`
- **Descripción:** Actualizar una categoría de habilidad existente
- **Requiere autenticación:** Sí
- **Parámetros de URL:**
  - `id` (número): ID de la habilidad
- **Parámetros del cuerpo:** Campos a actualizar (mismos que en creación)
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto de la habilidad actualizada
- **Respuestas de error:**
  - Código: 400 - Datos inválidos
  - Código: 401 - No autenticado
  - Código: 404 - Habilidad no encontrada

### Eliminar una habilidad

- **URL:** `/api/skills/:id`
- **Método:** `DELETE`
- **Descripción:** Eliminar una categoría de habilidad
- **Requiere autenticación:** Sí
- **Parámetros de URL:**
  - `id` (número): ID de la habilidad
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo:
    ```json
    {
      "message": "Skill deleted successfully"
    }
    ```
- **Respuestas de error:**
  - Código: 401 - No autenticado
  - Código: 404 - Habilidad no encontrada

## Artículos

### Obtener todos los artículos

- **URL:** `/api/articles`
- **Método:** `GET`
- **Descripción:** Obtener lista de artículos
- **Parámetros de consulta:**
  - `published` (boolean, opcional): Filtrar por estado de publicación
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Array de objetos de artículo

### Obtener un artículo por ID

- **URL:** `/api/articles/:id`
- **Método:** `GET`
- **Descripción:** Obtener detalles de un artículo específico por ID
- **Parámetros de URL:**
  - `id` (número): ID del artículo
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto de artículo
- **Respuestas de error:**
  - Código: 404 - Artículo no encontrado

### Obtener un artículo por slug

- **URL:** `/api/articles/slug/:slug`
- **Método:** `GET`
- **Descripción:** Obtener detalles de un artículo específico por slug
- **Parámetros de URL:**
  - `slug` (string): Slug del artículo
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto de artículo
- **Respuestas de error:**
  - Código: 404 - Artículo no encontrado

### Crear un artículo

- **URL:** `/api/articles`
- **Método:** `POST`
- **Descripción:** Crear un nuevo artículo
- **Requiere autenticación:** Sí
- **Parámetros del cuerpo:**
  - `title` (string, obligatorio): Título del artículo
  - `slug` (string, obligatorio): Slug para la URL
  - `summary` (string, obligatorio): Resumen del artículo
  - `content` (string, obligatorio): Contenido completo del artículo
  - `category` (string, obligatorio): Categoría del artículo
  - `imageUrl` (string, opcional): URL de la imagen
  - `published` (boolean, opcional): Estado de publicación
- **Respuesta exitosa:**
  - Código: 201
  - Cuerpo: Objeto del artículo creado
- **Respuestas de error:**
  - Código: 400 - Datos inválidos
  - Código: 401 - No autenticado

### Actualizar un artículo

- **URL:** `/api/articles/:id`
- **Método:** `PUT`
- **Descripción:** Actualizar un artículo existente
- **Requiere autenticación:** Sí
- **Parámetros de URL:**
  - `id` (número): ID del artículo
- **Parámetros del cuerpo:** Campos a actualizar (mismos que en creación)
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto del artículo actualizado
- **Respuestas de error:**
  - Código: 400 - Datos inválidos
  - Código: 401 - No autenticado
  - Código: 404 - Artículo no encontrado

### Publicar un artículo

- **URL:** `/api/articles/:id/publish`
- **Método:** `POST`
- **Descripción:** Cambiar el estado de un artículo a publicado
- **Requiere autenticación:** Sí
- **Parámetros de URL:**
  - `id` (número): ID del artículo
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto del artículo actualizado
- **Respuestas de error:**
  - Código: 401 - No autenticado
  - Código: 404 - Artículo no encontrado

### Despublicar un artículo

- **URL:** `/api/articles/:id/unpublish`
- **Método:** `POST`
- **Descripción:** Cambiar el estado de un artículo a no publicado
- **Requiere autenticación:** Sí
- **Parámetros de URL:**
  - `id` (número): ID del artículo
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto del artículo actualizado
- **Respuestas de error:**
  - Código: 401 - No autenticado
  - Código: 404 - Artículo no encontrado

### Eliminar un artículo

- **URL:** `/api/articles/:id`
- **Método:** `DELETE`
- **Descripción:** Eliminar un artículo
- **Requiere autenticación:** Sí
- **Parámetros de URL:**
  - `id` (número): ID del artículo
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo:
    ```json
    {
      "message": "Article deleted successfully"
    }
    ```
- **Respuestas de error:**
  - Código: 401 - No autenticado
  - Código: 404 - Artículo no encontrado

## Mensajes de Contacto

### Obtener todos los mensajes

- **URL:** `/api/messages`
- **Método:** `GET`
- **Descripción:** Obtener lista de todos los mensajes de contacto
- **Requiere autenticación:** Sí
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Array de objetos de mensaje

### Obtener un mensaje específico

- **URL:** `/api/messages/:id`
- **Método:** `GET`
- **Descripción:** Obtener detalles de un mensaje específico
- **Requiere autenticación:** Sí
- **Parámetros de URL:**
  - `id` (número): ID del mensaje
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto de mensaje
- **Respuestas de error:**
  - Código: 401 - No autenticado
  - Código: 404 - Mensaje no encontrado

### Crear un mensaje

- **URL:** `/api/messages`
- **Método:** `POST`
- **Descripción:** Enviar un nuevo mensaje de contacto
- **Parámetros del cuerpo:**
  - `name` (string, obligatorio): Nombre del remitente
  - `email` (string, obligatorio): Email del remitente
  - `message` (string, obligatorio): Contenido del mensaje
- **Respuesta exitosa:**
  - Código: 201
  - Cuerpo: Objeto del mensaje creado
- **Respuestas de error:**
  - Código: 400 - Datos inválidos

### Marcar un mensaje como leído

- **URL:** `/api/messages/:id/read`
- **Método:** `POST`
- **Descripción:** Marcar un mensaje como leído
- **Requiere autenticación:** Sí
- **Parámetros de URL:**
  - `id` (número): ID del mensaje
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto del mensaje actualizado
- **Respuestas de error:**
  - Código: 401 - No autenticado
  - Código: 404 - Mensaje no encontrado

### Eliminar un mensaje

- **URL:** `/api/messages/:id`
- **Método:** `DELETE`
- **Descripción:** Eliminar un mensaje
- **Requiere autenticación:** Sí
- **Parámetros de URL:**
  - `id` (número): ID del mensaje
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo:
    ```json
    {
      "message": "Message deleted successfully"
    }
    ```
- **Respuestas de error:**
  - Código: 401 - No autenticado
  - Código: 404 - Mensaje no encontrado

## Información del Sitio

### Obtener información del sitio

- **URL:** `/api/site-info`
- **Método:** `GET`
- **Descripción:** Obtener información general del sitio
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto con información del sitio

### Actualizar información del sitio

- **URL:** `/api/site-info`
- **Método:** `PUT`
- **Descripción:** Actualizar información general del sitio
- **Requiere autenticación:** Sí
- **Parámetros del cuerpo:**
  - `about` (string, opcional): Texto "Acerca de"
  - `contactEmail` (string, opcional): Email de contacto
  - `contactPhone` (string, opcional): Teléfono de contacto
  - `contactLocation` (string, opcional): Ubicación
  - `socialLinks` (object, opcional): Enlaces a redes sociales
    - `github` (string, opcional): URL de GitHub
    - `linkedin` (string, opcional): URL de LinkedIn
    - `twitter` (string, opcional): URL de Twitter
    - `dribbble` (string, opcional): URL de Dribbble
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto con información del sitio actualizada
- **Respuestas de error:**
  - Código: 400 - Datos inválidos
  - Código: 401 - No autenticado
  - Código: 404 - Información del sitio no encontrada

## CV

### Obtener datos del CV

- **URL:** `/api/cv`
- **Método:** `GET`
- **Descripción:** Obtener datos estructurados para el CV
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto con datos del CV (experiencias, educación, habilidades)

### Descargar CV como archivo

- **URL:** `/api/cv/download`
- **Método:** `GET`
- **Descripción:** Descargar el archivo CV
- **Respuesta exitosa:**
  - Código: 200
  - Tipo de contenido: application/pdf (u otro según el archivo)
  - Cuerpo: Archivo CV

### Subir archivo de CV

- **URL:** `/api/cv/upload`
- **Método:** `POST`
- **Descripción:** Subir un nuevo archivo de CV
- **Requiere autenticación:** Sí
- **Contenido:** Form-data con archivo
  - `cv` (file, obligatorio): Archivo de CV (PDF, DOC, DOCX)
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo:
    ```json
    {
      "message": "CV uploaded successfully",
      "cvFileUrl": "ruta/al/archivo.pdf"
    }
    ```
- **Respuestas de error:**
  - Código: 400 - Archivo inválido
  - Código: 401 - No autenticado

## Imagen de Hero

### Subir imagen de hero

- **URL:** `/api/hero-image/upload`
- **Método:** `POST`
- **Descripción:** Subir una imagen personalizada para la sección hero
- **Requiere autenticación:** Sí
- **Contenido:** Form-data con archivo
  - `hero` (file, obligatorio): Archivo de imagen
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo:
    ```json
    {
      "message": "Hero image uploaded successfully",
      "heroImageUrl": "ruta/a/la/imagen.jpg"
    }
    ```
- **Respuestas de error:**
  - Código: 400 - Archivo inválido
  - Código: 401 - No autenticado

### Restaurar imagen de hero por defecto

- **URL:** `/api/hero-image/reset`
- **Método:** `POST`
- **Descripción:** Restaurar la imagen de hero a la predeterminada
- **Requiere autenticación:** Sí
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo:
    ```json
    {
      "message": "Hero image reset to default"
    }
    ```
- **Respuestas de error:**
  - Código: 401 - No autenticado

## Importación/Exportación de Datos

### Exportar todos los datos

- **URL:** `/api/export`
- **Método:** `GET`
- **Descripción:** Exportar todos los datos del sitio
- **Requiere autenticación:** Sí
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo: Objeto JSON con todos los datos del sitio

### Importar datos

- **URL:** `/api/import`
- **Método:** `POST`
- **Descripción:** Importar datos al sitio
- **Requiere autenticación:** Sí
- **Parámetros del cuerpo:** Objeto JSON con datos del sitio
- **Respuesta exitosa:**
  - Código: 200
  - Cuerpo:
    ```json
    {
      "success": true,
      "message": "Data imported successfully"
    }
    ```
- **Respuestas de error:**
  - Código: 400 - Datos inválidos
  - Código: 401 - No autenticado