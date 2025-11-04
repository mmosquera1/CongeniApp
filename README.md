# CongeniApp Plataforma Vecinal

Este repositorio contiene una propuesta integral (base de datos en Firestore, backend y frontend) para CongeniApp, una comunidad digital que permite compartir reseñas sobre convivencia vecinal, recomendar servicios y crear un mercado de artículos usados dentro del edificio o barrio.

## Estructura

- `backend/`: API construida con Node.js, Express y Firebase Admin SDK.
- `frontend/`: Aplicación web en React + Vite integrada con Firebase Auth, Firestore y Storage.
- `backend/firebase/`: Reglas de seguridad, índices y documentación del modelo de datos en Firestore.

## Firestore

- Reglas de seguridad y modelo de datos detallado en `backend/firebase/`.
- Colecciones principales: `users`, `reviews`, `services`, `listings`, `verifications`, `buildings`, `geofences`.
- Las reseñas admiten hasta 3 imágenes; las publicaciones del mercado hasta 6 imágenes. Los documentos de verificación se almacenan en `verificationDocs/` en Cloud Storage.

## Backend (Node.js + Express)

### Variables de entorno

Renombrar `backend/.env.example` a `.env` y completar:

```
PORT=4000
ALLOWED_ORIGINS=http://localhost:5173
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_STORAGE_BUCKET=...
GOOGLE_MAPS_API_KEY=...
```

### Scripts

```
cd backend
npm install
npm run dev
```

Endpoints principales:

- `POST /api/users/register`: completa el perfil residencial y valida geolocalización (50 m) o documentación.
- `POST /api/verifications/documents`: sube archivos de respaldo para verificación manual.
- `POST /api/reviews`: crea reseñas y guarda el alias público (unidad).
- `POST /api/reviews/:id/rate`: vota reseñas como útiles/no útiles.
- `POST /api/services`: publica servicios recomendados.
- `POST /api/services/:id/rate`: puntúa un servicio.
- `POST /api/listings`: publica artículos del mercado vecinal.
- `PATCH /api/listings/:id/status`: actualiza estado (`active`, `reserved`, `sold`).

Todas las rutas protegidas requieren un Firebase ID Token válido en `Authorization: Bearer <token>`.

## Frontend (React + Vite)

### Variables de entorno

Renombrar `frontend/.env.example` a `.env` y completar las credenciales Web de Firebase y la URL del backend.

### Scripts

```
cd frontend
npm install
npm run dev
```

### Pantallas

- **Login / Registro**: autenticación por email/contraseña o Google.
- **Mi perfil**: captura dirección, etiqueta pública de la unidad y método de verificación (geolocalización o subida de documentos).
- **Dashboard**: resumen de reseñas recientes, servicios destacados y mercado.
- **Nueva reseña**: formulario con subida de hasta 3 imágenes hacia Firebase Storage.
- **Servicios**: alta de proveedores y valoración por los vecinos.
- **Mercado**: carga de artículos usados con imágenes en Storage y actualización de estado.

## Notas de implementación

- El backend usa Google Maps Geocoding API para validar que la ubicación ingresada esté dentro del radio configurado (50 m por defecto) del edificio.
- Se sugieren Cloud Functions para recalcular estadísticas agregadas (`stats.reviewCount`, etc.) cuando haya cambios masivos, aunque la API ya actualiza contadores básicos.
- Las reglas de Firestore permiten que el nombre completo del vecino quede privado, mostrando únicamente la etiqueta de unidad en las reseñas públicas.

## Próximos pasos sugeridos

- Implementar panel de administración para aprobar/rechazar verificaciones y gestionar reportes.
- Integrar notificaciones push / email para alertas de nuevos servicios o artículos.
- Añadir pruebas automatizadas (unitarias e integraciones) para endpoints críticos.
