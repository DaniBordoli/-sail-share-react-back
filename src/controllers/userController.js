const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Registrar un nuevo usuario
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

    const savedUser = await newUser.save();

    // No devolver la contraseña en la respuesta
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
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

// Login de usuario
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
    const { dniOrLicense, experienceDeclaration } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar solo los campos proporcionados
    if (dniOrLicense !== undefined) {
      user.dniOrLicense = dniOrLicense;
    }
    if (experienceDeclaration !== undefined) {
      user.experienceDeclaration = experienceDeclaration;
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
