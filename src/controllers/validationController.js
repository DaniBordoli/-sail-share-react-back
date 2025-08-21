const cloudinary = require('cloudinary').v2;
const User = require('../models/User');

// Subir licencia y marcar solicitud como pendiente
// Espera multipart/form-data con field name: 'file'
exports.uploadLicense = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'No autorizado' });
    if (!req.file) return res.status(400).json({ success: false, message: 'Falta el archivo (field name: file)' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    // Bloquear reenvío si ya existe una solicitud o está aprobada
    if (user.licenseStatus === 'pending') {
      return res.status(400).json({ success: false, message: 'Ya enviaste tu documento. Está pendiente de revisión.' });
    }
    if (user.licenseStatus === 'approved') {
      return res.status(400).json({ success: false, message: 'Tu licencia ya fue aprobada. No es necesario volver a enviar.' });
    }

    const folder = process.env.CLOUDINARY_LICENSES_FOLDER || 'licenses';

    const uploadResult = await new Promise((resolve, reject) => {
      const isPdf = req.file.mimetype === 'application/pdf' || /\.pdf$/i.test(req.file.originalname || '');
      const uploadOptions = {
        folder,
        public_id: `license_${user._id}_${Date.now()}`,
        overwrite: true,
        resource_type: isPdf ? 'raw' : 'auto',
      };
      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      stream.end(req.file.buffer);
    });

    user.licenseUrl = uploadResult.secure_url;
    user.licenseStatus = 'pending';
    await user.save();

    return res.json({
      success: true,
      message: 'Licencia subida. Queda pendiente de revisión.',
      data: { licenseUrl: user.licenseUrl, licenseStatus: user.licenseStatus },
    });
  } catch (error) {
    console.error('[license] error:', error?.message || error);
    return res.status(500).json({ success: false, message: 'Error subiendo licencia', error: error.message });
  }
};
