const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getAllUsers, 
  getUserById, 
  updateUser,
  verifyEmail,
  resendVerification
} = require('../controllers/userController');
const { verifyJWT } = require('../middleware/auth');

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

module.exports = router;
