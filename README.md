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
### 3. Ejecutar el servidor

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: `http://localhost:5000`

