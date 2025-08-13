const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// Base URL para construir callbacks en producción/preview
const BASE_URL = process.env.PUBLIC_BACKEND_URL || process.env.RENDER_EXTERNAL_URL || '';

// Verificar que las variables de entorno estén disponibles
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('Error: GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET deben estar definidos en el archivo .env');
  process.exit(1);
}

if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
  console.error('Error: FACEBOOK_APP_ID y FACEBOOK_APP_SECRET deben estar definidos en el archivo .env');
  process.exit(1);
}

// Construir callback URL de Google y loguear en desarrollo
const googleCallbackURL = BASE_URL ? `${BASE_URL}/api/auth/google/callback` : "/api/auth/google/callback";
if (process.env.NODE_ENV !== 'production') {
  try {
    console.log('🔎 Google OAuth config (dev):', {
      BASE_URL,
      googleCallbackURL,
      usesBaseUrl: Boolean(BASE_URL),
      clientIdSuffix: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.slice(-6) : undefined
    });
  } catch (_) {}
}

// Configuración de la estrategia de Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: googleCallbackURL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Verificar si el usuario ya existe
    let user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      return done(null, user);
    }
    
    // Crear nuevo usuario
    user = new User({
      firstName: profile.name.givenName || 'Usuario',
      lastName: profile.name.familyName || 'Google',
      email: profile.emails[0].value,
      phone: '', // Campo vacío para usuarios OAuth
      password: 'oauth_user_' + Date.now(), // Password único para usuarios OAuth
      googleId: profile.id,
      isVerified: true // Los usuarios de Google ya están verificados
    });
    
    await user.save();
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Configuración de la estrategia de Facebook
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: BASE_URL ? `${BASE_URL}/api/auth/facebook/callback` : "/api/auth/facebook/callback",
  profileFields: ['id', 'emails', 'name', 'displayName']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Verificar si el usuario ya existe por email
    let user = await User.findOne({ email: profile.emails?.[0]?.value });
    
    if (user) {
      // Si el usuario existe pero no tiene facebookId, agregarlo
      if (!user.facebookId) {
        user.facebookId = profile.id;
        await user.save();
      }
      return done(null, user);
    }
    
    // Crear nuevo usuario
    user = new User({
      firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'Usuario',
      lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || 'Facebook',
      email: profile.emails?.[0]?.value || `facebook_${profile.id}@facebook.com`, // Email por defecto si no está disponible
      phone: '', // Campo vacío para usuarios OAuth
      password: 'oauth_user_' + Date.now(), // Password único para usuarios OAuth
      facebookId: profile.id,
      isVerified: true // Los usuarios de Facebook ya están verificados
    });
    
    await user.save();
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Para JWT no necesitamos serialización de sesiones
// Estas funciones quedan por compatibilidad pero no se usan
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
