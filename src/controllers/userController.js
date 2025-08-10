const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail } = require('../utils/email');

// Registrar un nuevo usuario (con verificación por email)
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, dniOrLicense, experienceDeclaration } = req.body;

    // Validaciones básicas
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: firstName, lastName, email, phone, password'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      dniOrLicense,
      experienceDeclaration
    });

    // Generar token de verificación
    const token = crypto.randomBytes(32).toString('hex');
    newUser.verificationToken = token;
    newUser.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const savedUser = await newUser.save();

    // Construir URL absoluta al endpoint de verificación del backend
    const backendBase = `${req.protocol}://${req.get('host')}`;
    const frontendBase = process.env.CLIENT_URL || process.env.FRONTEND_URL;
    const verifyUrl = frontendBase
      ? `${frontendBase.replace(/\/$/, '')}/verify-email?token=${token}`
      : `${backendBase}/api/users/verify-email?token=${token}`;

    // Enviar correo de verificación (o log si no hay SMTP)
    try {
      await sendMail({
        to: email,
        subject: 'Verifica tu cuenta - NavBoat',
        html: `
          <h1>Bienvenido/a a NavBoat</h1>
          <p>Para activar tu cuenta, verifica tu correo haciendo clic en el siguiente botón:</p>
          <p><a href="${verifyUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Verificar mi cuenta</a></p>
          <p>O copia y pega este enlace en tu navegador: <br/> ${verifyUrl}</p>
          <p>Este enlace expira en 24 horas.</p>
        `,
      });
      console.log(`[email] Verification email sent to ${email}: ${verifyUrl}`);
    } catch (e) {
      // No bloquear el registro por fallo de envío; el usuario puede reenviar luego
      console.warn('No se pudo enviar el email de verificación:', e?.message || e);
    }

    // No devolver la contraseña en la respuesta
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Usuario creado. Revisa tu email para verificar la cuenta.',
      data: userResponse
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
};

// Verificar email con token
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token faltante' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token inválido o expirado' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.json({ success: true, message: 'Email verificado correctamente' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al verificar email', error: error.message });
  }
};

// Reenviar correo de verificación
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email requerido' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'La cuenta ya está verificada' });

    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = token;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const backendBase = `${req.protocol}://${req.get('host')}`;
    const frontendBase = process.env.CLIENT_URL || process.env.FRONTEND_URL;
    const verifyUrl = frontendBase
      ? `${frontendBase.replace(/\/$/, '')}/verify-email?token=${token}`
      : `${backendBase}/api/users/verify-email?token=${token}`;
    await sendMail({
      to: email,
      subject: 'Reenviar verificación - NavBoat',
      html: `
        <p>Haz clic para verificar tu cuenta:</p>
        <p><a href="${verifyUrl}">Verificar mi cuenta</a></p>
        <p>Este enlace expira en 24 horas.</p>
      `,
    });
    console.log(`[email] Verification RESEND sent to ${email}: ${verifyUrl}`);

    return res.json({ success: true, message: 'Correo de verificación reenviado' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al reenviar verificación', error: error.message });
  }
};

// Login de usuario (requiere email verificado)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    // Si no está verificado, bloquear acceso
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Debes verificar tu correo antes de iniciar sesión.'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    // Login exitoso - no devolver la contraseña
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login exitoso',
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-password');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// Obtener usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};

// Actualizar usuario
exports.updateUser = async (req, res) => {
  try {
    const { dniOrLicense, experienceDeclaration, firstName, lastName, phone } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Autorización: solo el propietario puede actualizar su perfil
    if (req.user && String(req.user._id) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar este usuario'
      });
    }

    // Actualizar solo los campos proporcionados
    if (dniOrLicense !== undefined) {
      user.dniOrLicense = dniOrLicense;
    }
    if (experienceDeclaration !== undefined) {
      user.experienceDeclaration = experienceDeclaration;
    }
    if (firstName !== undefined) {
      user.firstName = firstName;
    }
    if (lastName !== undefined) {
      user.lastName = lastName;
    }
    if (phone !== undefined) {
      user.phone = phone;
    }

    const updatedUser = await user.save();

    // No devolver la contraseña en la respuesta
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: userResponse
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};
