
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: function() {
      // Solo requerido si no es un usuario OAuth (Google o Facebook)
      return !this.googleId && !this.facebookId;
    },
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  // Nuevos campos específicos
  dniOrLicense: {
    type: String,
    trim: true
  },
  experienceDeclaration: {
    type: String,
    trim: true
  },
  // Avatar del usuario
  avatar: {
    type: String, // URL pública (Cloudinary)
    trim: true
  },
  avatarPublicId: {
    type: String, // Public ID en Cloudinary para manejar reemplazos/eliminaciones
    trim: true
  },
  // Estado de verificación
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    index: true,
    sparse: true
  },
  verificationTokenExpires: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // IDs para OAuth
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true
  },
  // Rol y administración
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Reputación (opcional)
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  ratingCount: {
    type: Number,
    min: 0,
    default: 0
  },
  // Validación de licencia
  licenseStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  licenseUrl: {
    type: String,
    trim: true
  },
  // Favoritos del usuario (referencias a barcos)
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Boat' }]
}, {
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

// Hashear la contraseña usando bcrypt antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
