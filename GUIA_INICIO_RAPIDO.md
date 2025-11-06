# 🚀 Guía de Inicio Rápido - CongeniApp

Esta guía te ayudará a ejecutar la aplicación en tu navegador paso a paso.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
- **Node.js** (versión 18 o superior) - [Descargar aquí](https://nodejs.org/)
- **npm** (viene con Node.js)
- Una cuenta de **Firebase** con un proyecto creado
- Una **API Key de Google Maps** (para geolocalización)

## 🔧 Paso 1: Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Habilita los siguientes servicios:
   - **Authentication** (Email/Password y Google)
   - **Firestore Database**
   - **Storage**

4. Obtén tus credenciales:
   - **Web App Config**: Ve a Project Settings > General > Your apps > Web app
   - **Service Account**: Ve a Project Settings > Service Accounts > Generate new private key

## 🔧 Paso 2: Configurar el Backend

1. **Navega a la carpeta backend:**
   ```bash
   cd backend
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Crea el archivo `.env`** (copia de `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. **Edita el archivo `.env`** con tus credenciales de Firebase:
   ```env
   PORT=4000
   ALLOWED_ORIGINS=http://localhost:5173
   FIREBASE_PROJECT_ID=tu-proyecto-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk@tu-proyecto.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   GOOGLE_MAPS_API_KEY=tu-api-key-de-google-maps
   ```

   ⚠️ **Importante**: El `FIREBASE_PRIVATE_KEY` debe estar entre comillas y con los `\n` para los saltos de línea.

5. **Inicia el servidor backend:**
   ```bash
   npm run dev
   ```

   Deberías ver: `CongeniApp API listening on port 4000`

## 🔧 Paso 3: Configurar el Frontend

1. **Abre una nueva terminal** (mantén el backend corriendo)

2. **Navega a la carpeta frontend:**
   ```bash
   cd frontend
   ```

3. **Instala las dependencias:**
   ```bash
   npm install
   ```

4. **Crea el archivo `.env`** (copia de `.env.example`):
   ```bash
   cp .env.example .env
   ```

5. **Edita el archivo `.env`** con tus credenciales de Firebase Web:
   ```env
   VITE_FIREBASE_API_KEY=tu-api-key-web
   VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
   VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
   VITE_BACKEND_URL=http://localhost:4000
   ```

   Puedes encontrar estos valores en Firebase Console > Project Settings > General > Your apps > Web app

6. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

   Deberías ver algo como: `Local: http://localhost:5173/`

## 🌐 Paso 4: Abrir en el Navegador

1. **Abre tu navegador** y ve a: `http://localhost:5173`

2. **Deberías ver la página de login** de CongeniApp

## ✅ Verificación

Si todo está configurado correctamente:

- ✅ El backend está corriendo en `http://localhost:4000`
- ✅ El frontend está corriendo en `http://localhost:5173`
- ✅ Puedes ver la página de login en tu navegador
- ✅ Puedes crear una cuenta o iniciar sesión

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
# Asegúrate de haber ejecutado npm install en ambas carpetas
cd backend && npm install
cd ../frontend && npm install
```

### Error: "Firebase: Error (auth/invalid-api-key)"
- Verifica que las credenciales en `.env` del frontend sean correctas
- Asegúrate de que no haya espacios extra o comillas mal colocadas

### Error: "Missing Firebase service account environment variables"
- Verifica que el archivo `.env` del backend exista
- Revisa que `FIREBASE_PRIVATE_KEY` tenga los `\n` para saltos de línea

### El backend no inicia
- Verifica que el puerto 4000 no esté en uso
- Revisa los logs en la terminal para ver el error específico

### El frontend no se conecta al backend
- Asegúrate de que el backend esté corriendo
- Verifica que `VITE_BACKEND_URL=http://localhost:4000` en el `.env` del frontend

## 📝 Notas Importantes

1. **Mantén ambas terminales abiertas**: Una para el backend y otra para el frontend
2. **Primero inicia el backend**, luego el frontend
3. **Los cambios en el código se reflejan automáticamente** gracias a Vite (frontend) y ts-node-dev (backend)

## 🎯 Próximos Pasos

Una vez que la app esté funcionando:

1. **Crea un edificio en Firestore** manualmente (colección `buildings`) para poder registrar usuarios
2. **Prueba el registro** con geolocalización o documentación
3. **Crea reseñas, servicios y publicaciones** del mercado

¡Disfruta explorando CongeniApp! 🎉
