# Guía de Instalación - Loy-Agregadores

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18 o superior
- **MongoDB** 6 o superior
- **npm** o **yarn**
- Cuenta de **Google Cloud** (para OAuth)
- Credenciales de **Uber Eats API**
- Token de acceso de **Loyverse**

## 🚀 Instalación Paso a Paso

### 1. Clonar o Descargar el Proyecto

El proyecto ya está en tu carpeta local:
```
c:/Users/oscar.castro/OneDrive - International Food Services - Grupo KFC/Documentos/WEB/Loy-Agregadores
```

### 2. Instalar MongoDB

#### Windows:
1. Descargar MongoDB Community Server desde: https://www.mongodb.com/try/download/community
2. Instalar con las opciones por defecto
3. MongoDB se instalará como servicio y se iniciará automáticamente

#### Verificar instalación:
```bash
mongod --version
```

### 3. Configurar Google OAuth

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear un nuevo proyecto o seleccionar uno existente
3. Ir a "APIs y servicios" > "Credenciales"
4. Hacer clic en "Crear credenciales" > "ID de cliente de OAuth 2.0"
5. Configurar pantalla de consentimiento si es necesario
6. Tipo de aplicación: "Aplicación web"
7. Agregar URIs de redirección autorizados:
   - `http://localhost:5000/api/auth/google/callback`
8. Copiar el **Client ID** y **Client Secret**

### 4. Configurar Variables de Entorno

#### Backend (.env)

Navegar a la carpeta backend:
```bash
cd backend
```

Copiar el archivo de ejemplo:
```bash
copy .env.example .env
```

Editar el archivo `.env` con tus credenciales:

```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb://localhost:27017/loy-agregadores

# JWT
JWT_SECRET=tu_secret_key_super_seguro_cambialo_ahora
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Session
SESSION_SECRET=tu_session_secret_super_seguro

# Uber Eats API
UBER_API_URL=https://api.uber.com/v1/eats
UBER_WEBHOOK_SECRET=tu_webhook_secret

# Loyverse API
LOYVERSE_API_URL=https://api.loyverse.com/v1.0

# Encryption (32 caracteres mínimo)
ENCRYPTION_KEY=tu_encryption_key_de_32_caracteres_minimo_para_seguridad
```

#### Frontend (.env)

Navegar a la carpeta frontend:
```bash
cd ../frontend
```

Copiar el archivo de ejemplo:
```bash
copy .env.example .env
```

Editar el archivo `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Instalar Dependencias

#### Opción 1: Instalar todo desde la raíz
```bash
cd ..
npm run install:all
```

#### Opción 2: Instalar manualmente

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd ../frontend
npm install
```

### 6. Iniciar la Aplicación

#### Opción 1: Iniciar todo desde la raíz
```bash
cd ..
npm run dev
```

Esto iniciará tanto el backend como el frontend simultáneamente.

#### Opción 2: Iniciar manualmente en terminales separadas

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 7. Acceder a la Aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🔧 Configuración Inicial en la Aplicación

### 1. Iniciar Sesión

1. Abrir http://localhost:5173
2. Hacer clic en "Continuar con Google"
3. Autorizar la aplicación con tu cuenta de Google

### 2. Configurar Uber Eats

1. Ir a "Agregadores" en el menú lateral
2. Hacer clic en "Agregar Agregador"
3. Seleccionar "Uber Eats"
4. Hacer clic en "Configurar"
5. Ingresar tus credenciales de Uber Eats:
   - **Store ID**: ID de tu tienda en Uber Eats
   - **Client ID**: Client ID de la API
   - **Client Secret**: Client Secret de la API
6. Configurar opciones de sincronización
7. Hacer clic en "Probar Conexión" para verificar
8. Guardar la configuración

### 3. Configurar Loyverse

1. Ir a "Agregadores" > "Configurar Loyverse"
2. Ingresar tu token de acceso de Loyverse
3. Seleccionar tu tienda
4. Configurar opciones de sincronización
5. Probar la conexión
6. Guardar

### 4. Iniciar Sincronización

1. Ir al Dashboard
2. Hacer clic en "Sincronizar Ahora"
3. Las órdenes de Uber Eats se sincronizarán automáticamente con Loyverse

## 📚 Obtener Credenciales

### Uber Eats API

1. Ir a [Uber Developer Portal](https://developer.uber.com/)
2. Crear una cuenta o iniciar sesión
3. Crear una nueva aplicación
4. Seleccionar "Eats" como producto
5. Obtener Client ID y Client Secret
6. Configurar webhooks (opcional)

### Loyverse API

1. Ir a [Loyverse BackOffice](https://r.loyverse.com/)
2. Iniciar sesión con tu cuenta
3. Ir a "Configuración" > "API Access"
4. Generar un nuevo token de acceso
5. Copiar el token (solo se muestra una vez)

## 🐛 Solución de Problemas

### MongoDB no se conecta

**Error**: `MongoServerError: connect ECONNREFUSED`

**Solución**:
```bash
# Verificar si MongoDB está corriendo
mongod --version

# En Windows, verificar el servicio
services.msc
# Buscar "MongoDB" y asegurarse de que está "En ejecución"

# O iniciar manualmente
mongod --dbpath "C:\data\db"
```

### Error de autenticación con Google

**Error**: `redirect_uri_mismatch`

**Solución**:
- Verificar que la URL de callback en Google Cloud Console coincida exactamente con:
  `http://localhost:5000/api/auth/google/callback`
- Asegurarse de que no haya espacios ni caracteres extra

### Puerto ya en uso

**Error**: `EADDRINUSE: address already in use`

**Solución**:
```bash
# Windows - Encontrar el proceso usando el puerto
netstat -ano | findstr :5000

# Matar el proceso (reemplazar PID con el número del proceso)
taskkill /PID <PID> /F
```

### Dependencias no se instalan

**Solución**:
```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📝 Scripts Disponibles

### Raíz del proyecto
- `npm run install:all` - Instalar todas las dependencias
- `npm run dev` - Iniciar backend y frontend en modo desarrollo
- `npm run dev:backend` - Iniciar solo el backend
- `npm run dev:frontend` - Iniciar solo el frontend
- `npm run build` - Construir el frontend para producción
- `npm start` - Iniciar el backend en modo producción

### Backend
- `npm run dev` - Iniciar en modo desarrollo con nodemon
- `npm start` - Iniciar en modo producción

### Frontend
- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Previsualizar build de producción

## 🔒 Seguridad

**IMPORTANTE**: Antes de desplegar a producción:

1. Cambiar todos los secrets en el archivo `.env`
2. Usar contraseñas fuertes y únicas
3. Nunca commitear archivos `.env` al repositorio
4. Habilitar HTTPS en producción
5. Configurar CORS apropiadamente
6. Implementar rate limiting adicional
7. Revisar y actualizar dependencias regularmente

## 📞 Soporte

Si encuentras algún problema durante la instalación:

1. Revisar esta guía completa
2. Verificar que todos los requisitos previos estén instalados
3. Revisar los logs de error en la consola
4. Verificar que MongoDB esté corriendo
5. Asegurarse de que los puertos 5000 y 5173 estén disponibles

## ✅ Verificación de Instalación Exitosa

Si todo está funcionando correctamente, deberías poder:

1. ✅ Acceder a http://localhost:5173
2. ✅ Iniciar sesión con Google
3. ✅ Ver el Dashboard
4. ✅ Agregar y configurar agregadores
5. ✅ Probar la conexión con Uber Eats y Loyverse
6. ✅ Sincronizar órdenes
7. ✅ Ver logs de sincronización

¡Felicidades! Tu instalación está completa. 🎉
