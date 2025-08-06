# SailShare Backend

Backend API para la plataforma de alquiler de barcos SailShare.

## Configuración rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
1. Copia el archivo `.env.example` a `.env`
2. Edita el archivo `.env` con tu string de conexión de MongoDB Atlas:

```
MONGODB_URI=mongodb+srv://tu-usuario:tu-password@tu-cluster.mongodb.net/sailshare?retryWrites=true&w=majority
```

### 3. Obtener string de conexión de MongoDB Atlas

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Inicia sesión o crea una cuenta
3. Crea un nuevo cluster (gratuito)
4. Ve a "Database Access" y crea un usuario
5. Ve a "Network Access" y añade tu IP (o 0.0.0.0/0 para acceso desde cualquier lugar)
6. Haz clic en "Connect" en tu cluster
7. Selecciona "Connect your application"
8. Copia el connection string y reemplaza `<password>` con tu contraseña

### 4. Ejecutar el servidor

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: `http://localhost:5000`

## Endpoints disponibles

- `GET /` - Estado del servidor
- `GET /api/boats` - Obtener todos los barcos
- `GET /api/boats/:id` - Obtener un barco específico

## Conectar con el frontend

En tu frontend React, puedes hacer peticiones a:
```javascript
const API_URL = 'http://localhost:5000/api';

// Ejemplo de fetch
fetch(`${API_URL}/boats`)
  .then(response => response.json())
  .then(data => console.log(data));
```
