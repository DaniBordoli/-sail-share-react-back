const passport = require('passport');
const jwt = require('jsonwebtoken');

// Iniciar autenticación con Google
exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// Iniciar autenticación con Facebook
exports.facebookAuth = passport.authenticate('facebook', {
  scope: ['email']
});

// Callback de Google
exports.googleCallback = [
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_failed`,
    session: false // Importante: sin sesiones
  }),
  (req, res) => {
    // Generar JWT token
    const token = jwt.sign(
      { id: req.user._id }, 
      process.env.JWT_SECRET || 'default_secret', 
      { expiresIn: '1d' }
    );
    
    // Redirigir al frontend con el token y el proveedor
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/success?token=${token}&provider=google`);
  }
];

// Callback de Facebook
exports.facebookCallback = [
  passport.authenticate('facebook', { 
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_failed`,
    session: false // Importante: sin sesiones
  }),
  (req, res) => {
    // Generar JWT token
    const token = jwt.sign(
      { id: req.user._id }, 
      process.env.JWT_SECRET || 'default_secret', 
      { expiresIn: '1d' }
    );
    
    // Redirigir al frontend con el token y el proveedor
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/success?token=${token}&provider=facebook`);
  }
];

// Logout
exports.logout = (req, res) => {
  // Para JWT no hay sesión que cerrar en el servidor
  // El cliente debe eliminar el token del localStorage
  res.json({ message: 'Para cerrar sesión, elimina el token del cliente' });
};

// Verificar si el usuario está autenticado
exports.getCurrentUser = (req, res) => {
  // Con JWT, la verificación se hace mediante middleware
  // Este endpoint necesitaría un middleware de JWT para funcionar
  res.status(401).json({ 
    message: 'Este endpoint requiere autenticación JWT - implementar middleware' 
  });
};
