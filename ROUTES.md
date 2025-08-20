# SailShare API - Rutas del Backend

Este documento describe las rutas expuestas por el backend, según los archivos de rutas y servidor en `src/`.

- Base URL local: `http://localhost:<PORT>` (por defecto `5000`)
- Prefix API: `'/api'`
- Archivo servidor: `src/server.js`
- Rutas: `src/routes/authRoutes.js`, `src/routes/userRoutes.js`

## Middleware y configuración

- CORS habilitado: `app.use(cors())`
- Parsing JSON: `app.use(express.json())`
- Logging simple de requests: imprime método y URL con timestamp
- Passport inicializado: `passport.initialize()` (OAuth Google/Facebook)
- Manejo 404: cualquier ruta no encontrada responde `{ message: 'Ruta no encontrada', path }`
- Manejo errores 500: responde `{ message: 'Error interno del servidor' }` (muestra detalle solo en `NODE_ENV=development`)

## Salud / raíz

- GET `/` → 200 OK
  - Respuesta: `{ message: 'SailShare API funcionando', status: 'OK' }`

## Rutas de Barcos (placeholders)

- GET `/api/boats`
  - Descripción: Obtiene listado de barcos (placeholder)
  - Respuesta: `{ message: 'Endpoint para obtener barcos' }`

- GET `/api/boats/:id`
  - Descripción: Obtiene detalle de barco por ID (placeholder)
  - Params: `id`
  - Respuesta: `{ message: 'Endpoint para obtener barco con ID: <id>' }`

## Rutas de Usuarios (`/api/users`)
Archivo: `src/routes/userRoutes.js` — Controlador: `src/controllers/userController.js`

- POST `/api/users/register`
  - Acción: Registrar usuario
  - Handler: `registerUser`

- POST `/api/users/login`
  - Acción: Login de usuario
  - Handler: `loginUser`

- GET `/api/users/`
  - Acción: Obtener todos los usuarios
  - Handler: `getAllUsers`

- GET `/api/users/:id`
  - Acción: Obtener usuario por ID
  - Params: `id`
  - Handler: `getUserById`

- PUT `/api/users/:id`
  - Acción: Actualizar usuario por ID
  - Params: `id`
  - Handler: `updateUser`

## Rutas de Autenticación (`/api/auth`)
Archivo: `src/routes/authRoutes.js` — Controlador: `src/controllers/authController.js`

Descripción general:
- __Estrategias__: Google OAuth 2.0 y Facebook (Passport) definidas en `src/config/passport.js`.
- __Sesiones__: desactivadas (`session: false`), autenticación basada en JWT.
- __Token__: generado en los callbacks, payload `{ id: <user._id> }`, expira en `1d`, secreto `process.env.JWT_SECRET`.
- __Redirección__: al frontend `CLIENT_URL` con `token` y `provider` como query params.

Variables de entorno requeridas:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`
- `JWT_SECRET` (recomendado, se usa `default_secret` si falta)
- `CLIENT_URL` (por defecto `http://localhost:3000`)

Endpoints y flujos:

- GET `/api/auth/google`
  - __Acción__: Inicia el flujo OAuth con Google.
  - __Alcances__: `['profile', 'email']`.
  - __Handler__: `googleAuth` → `passport.authenticate('google', ...)`.

- GET `/api/auth/google/callback`
  - __Acción__: Callback de Google.
  - __Auth__: `passport.authenticate('google', { failureRedirect, session: false })`.
  - __Post-auth__: genera JWT y hace `res.redirect` a `${CLIENT_URL}/auth/success?token=<jwt>&provider=google`.
  - __Handler__: `googleCallback` (array middleware).

- GET `/api/auth/facebook`
  - __Acción__: Inicia el flujo OAuth con Facebook.
  - __Alcances__: `['email']`.
  - __Handler__: `facebookAuth` → `passport.authenticate('facebook', ...)`.

- GET `/api/auth/facebook/callback`
  - __Acción__: Callback de Facebook.
  - __Auth__: `passport.authenticate('facebook', { failureRedirect, session: false })`.
  - __Post-auth__: genera JWT y hace `res.redirect` a `${CLIENT_URL}/auth/success?token=<jwt>&provider=facebook`.
  - __Handler__: `facebookCallback` (array middleware).

- POST `/api/auth/logout`
  - __Acción__: Logout lógico para JWT.
  - __Comportamiento__: no hay sesión de servidor que cerrar; el cliente debe borrar el token.
  - __Respuesta__: `{ message: 'Para cerrar sesión, elimina el token del cliente' }`.
  - __Handler__: `logout`.

- GET `/api/auth/me`
  - __Acción__: Obtener usuario autenticado actual.
  - __Estado actual__: requiere middleware JWT que aún no está implementado.
  - __Respuesta__: `401 { message: 'Este endpoint requiere autenticación JWT - implementar middleware' }`.
  - __Handler__: `getCurrentUser`.

Detalles de Passport (`src/config/passport.js`):
- __GoogleStrategy__
  - `callbackURL`: `/api/auth/google/callback`.
  - Busca usuario por email; si no existe, crea uno con `googleId` y `isVerified: true`.
- __FacebookStrategy__
  - `callbackURL`: `/api/auth/facebook/callback`.
  - `profileFields`: `['id','emails','name','displayName']`.
  - Busca por email (si falta, genera `facebook_<id>@facebook.com`); agrega `facebookId` si ya existía.

Notas de seguridad y buenas prácticas:
- Usa un `JWT_SECRET` fuerte y rotación si es posible.
- Valida y guarda el JWT en el cliente con medidas de seguridad (ej. `httpOnly` cookies si migras a cookies, o almacenamiento seguro si SPA).
- Implementa un middleware JWT (ej. `Authorization: Bearer <token>`) y aplícalo a `/api/auth/me` y rutas protegidas.
- Considera CSRF y validación del `state` en OAuth si añades capas extra.

## Notas adicionales

- Conexión MongoDB: definida en `src/server.js` usando `process.env.MONGODB_URI`.
- El servidor imprime al iniciar: URL local y una referencia a documentación (`/api`), aunque no hay un endpoint `/api` explícito.
- Asegúrate de configurar variables de entorno (Google/Facebook OAuth y MongoDB) en `.env`.
