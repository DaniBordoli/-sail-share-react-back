const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

// Inicializar Cloudinary (usa CLOUDINARY_URL si está disponible)
try {
  cloudinary.config({ secure: true });
} catch (_) {}

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
// (Logs de desarrollo removidos)

// Configuración de la estrategia de Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: googleCallbackURL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // (Logs de desarrollo removidos)

    // Verificar si el usuario ya existe
    let user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Si no tiene avatar, intentar importarlo desde Google
      if (!user.avatar) {
        const photo = profile.photos && profile.photos[0] && profile.photos[0].value;
        const hiRes = photo ? photo.replace(/=s\d+-c$/, '=s512-c') : undefined;
        if (photo) {
          try {
            const up = await cloudinary.uploader.upload(hiRes || photo, {
              folder: process.env.CLOUDINARY_FOLDER || 'avatars',
              public_id: `user_${user._id}`,
              overwrite: true,
              resource_type: 'image',
            });
            user.avatar = up.secure_url;
            user.avatarPublicId = up.public_id;
            await user.save();
          } catch (e) {
            // No bloquear login si falla avatar: guardar la URL de Google como fallback
            console.warn('[oauth:google] avatar upload failed (existing user):', e?.message || e);
            try {
              user.avatar = hiRes || photo;
              await user.save();
            } catch (_) {}
          }
        }
      }
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
    // Intentar importar avatar de Google para nuevo usuario (no obligatorio)
    const photo = profile.photos && profile.photos[0] && profile.photos[0].value;
    const hiRes = photo ? photo.replace(/=s\d+-c$/, '=s512-c') : undefined;
    try {
      if (photo) {
        const up = await cloudinary.uploader.upload(hiRes || photo, {
          folder: process.env.CLOUDINARY_FOLDER || 'avatars',
          public_id: `user_${user._id}`,
          overwrite: true,
          resource_type: 'image',
        });
        user.avatar = up.secure_url;
        user.avatarPublicId = up.public_id;
        await user.save();
      }
    } catch (e) {
      // Ignorar fallo de avatar. Fallback: guardar URL de Google
      console.warn('[oauth:google] avatar upload failed (new user):', e?.message || e);
      try {
        if (photo) {
          user.avatar = hiRes || photo;
          await user.save();
        }
      } catch (_) {}
    }
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
