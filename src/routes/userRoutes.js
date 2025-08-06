const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getAllUsers, 
  getUserById, 
  updateUser 
} = require('../controllers/userController');

// Ruta para registrar usuario
router.post('/register', registerUser);

// Ruta para login
router.post('/login', loginUser);

// Ruta para obtener todos los usuarios
router.get('/', getAllUsers);

// Ruta para obtener usuario por ID
router.get('/:id', getUserById);

// Ruta para actualizar usuario
router.put('/:id', updateUser);

module.exports = router;
