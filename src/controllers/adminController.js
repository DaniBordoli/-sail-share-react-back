const User = require('../models/User');

// Listar solicitudes de licencia pendientes
exports.listLicenseRequests = async (req, res) => {
  try {
    const pending = await User.find({ licenseStatus: 'pending' })
      .select('_id firstName lastName email phone licenseUrl licenseStatus createdAt');
    return res.json({ success: true, count: pending.length, data: pending });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error listando solicitudes', error: error.message });
  }
};

// Aprobar licencia
exports.approveLicense = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    user.licenseStatus = 'approved';
    await user.save();

    return res.json({ success: true, message: 'Licencia aprobada', data: { userId: user._id, licenseStatus: user.licenseStatus } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al aprobar licencia', error: error.message });
  }
};

// Rechazar licencia
exports.rejectLicense = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    user.licenseStatus = 'rejected';
    await user.save();

    return res.json({ success: true, message: 'Licencia rechazada', data: { userId: user._id, licenseStatus: user.licenseStatus } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al rechazar licencia', error: error.message });
  }
};
