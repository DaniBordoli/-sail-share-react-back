const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getAllUsers, 
  getUserById, 
  updateUser,
  verifyEmail,
  resendVerification,
  uploadUserAvatar
} = require('../controllers/userController');
const { verifyJWT } = require('../middleware/auth');
const multer = require('multer');

// Usar almacenamiento en memoria para pasar el buffer a Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Ruta para registrar usuario
router.post('/register', registerUser);

// Ruta para login
router.post('/login', loginUser);

// Verificación de email
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

// Ruta para obtener todos los usuarios
router.get('/', getAllUsers);

// Ruta para obtener usuario por ID
router.get('/:id', getUserById);

// Ruta para actualizar usuario (protegida)
router.put('/:id', verifyJWT, updateUser);

// Ruta para subir avatar (protegida)
// Field name esperado: 'file'
router.post('/:id/avatar', verifyJWT, upload.single('file'), uploadUserAvatar);

module.exports = router;
