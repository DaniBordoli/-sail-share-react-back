const express = require('express');
const router = express.Router();
const { 
  googleAuth, 
  googleCallback,
  facebookAuth,
  facebookCallback,
  logout, 
  getCurrentUser 
} = require('../controllers/authController');

// Rutas de autenticación con Google
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Rutas de autenticación con Facebook
router.get('/facebook', facebookAuth);
router.get('/facebook/callback', facebookCallback);

// Ruta para logout
router.post('/logout', logout);

// Ruta para obtener usuario actual
router.get('/me', getCurrentUser);

module.exports = router;
