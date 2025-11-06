# Loy-Agregadores

Plataforma web para integrar Loyverse con agregadores de delivery como Uber Eats, Rappi y PedidosYa.

## 🚀 Características

- ✅ Autenticación con Google OAuth
- ✅ Gestión multi-usuario con perfiles personalizados
- ✅ Integración con Uber Eats API
- ✅ Integración con Loyverse API
- ✅ Sincronización automática de órdenes
- ✅ Mapeo de productos y categorías
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Sistema de logs y monitoreo
- ✅ Webhooks para sincronización instantánea

## 🛠️ Stack Tecnológico

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Passport.js (Google OAuth)
- JWT para autenticación
- Axios para APIs externas

### Frontend
- React 18 + Vite
- TailwindCSS
- shadcn/ui components
- React Router v6
- Axios

## 📋 Requisitos Previos

- Node.js 18+ 
- MongoDB 6+
- Cuenta de Google Cloud (para OAuth)
- Credenciales de Uber Eats API
- Token de acceso de Loyverse

## 🔧 Instalación

1. Clonar el repositorio
```bash
git clone <repo-url>
cd Loy-Agregadores
```

2. Instalar dependencias
```bash
npm run install:all
```

3. Configurar variables de entorno

Backend - crear `backend/.env`:
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

MONGODB_URI=mongodb://localhost:27017/loy-agregadores

JWT_SECRET=tu_secret_key_super_seguro
JWT_EXPIRE=7d

GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

UBER_API_URL=https://api.uber.com/v1/eats
UBER_WEBHOOK_SECRET=tu_webhook_secret

LOYVERSE_API_URL=https://api.loyverse.com/v1.0
```

Frontend - crear `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Iniciar MongoDB
```bash
mongod
```

5. Iniciar la aplicación
```bash
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📁 Estructura del Proyecto

```
Loy-Agregadores/
├── backend/          # API REST con Express
├── frontend/         # Aplicación React
└── README.md
```

## 🔐 Configuración de Google OAuth

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear un nuevo proyecto
3. Habilitar Google+ API
4. Crear credenciales OAuth 2.0
5. Agregar URIs autorizados:
   - http://localhost:5000
   - http://localhost:5000/api/auth/google/callback
6. Copiar Client ID y Client Secret al archivo .env

## 📚 Documentación de APIs

### Uber Eats
- [Documentación oficial](https://developer.uber.com/docs/eats)

### Loyverse
- [Documentación oficial](https://developer.loyverse.com/docs)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## 📄 Licencia

MIT
