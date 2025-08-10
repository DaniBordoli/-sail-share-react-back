const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('🔗 Intentando conectar a MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ ¡Conexión exitosa a MongoDB Atlas!');
    console.log('📊 Base de datos:', mongoose.connection.name);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

testConnection();
