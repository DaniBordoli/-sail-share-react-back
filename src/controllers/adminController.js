const User = require('../models/User');
const Boat = require('../models/Boat');

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

// === BOATS REVIEW WORKFLOW ===

// GET /api/admin/boats?status=pending_review&q=...&owner=...&page=&limit=
exports.listBoats = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const status = req.query.status ? String(req.query.status) : undefined;
    const q = req.query.q ? String(req.query.q).trim() : '';
    const owner = req.query.owner ? String(req.query.owner) : undefined;

    const filter = {};
    if (status) filter.status = status;
    if (owner) filter.ownerId = owner;
    if (q) filter.name = { $regex: q, $options: 'i' };

    const total = await Boat.countDocuments(filter);
    const items = await Boat.find(filter)
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Attach ownerName (firstName lastName or email) for admin preview convenience
    try {
      const ownerIds = [...new Set(items.map(it => String(it.ownerId)).filter(Boolean))];
      if (ownerIds.length) {
        const users = await User.find({ _id: { $in: ownerIds } }).select('_id firstName lastName email').lean();
        const byId = new Map(users.map(u => [String(u._id), u]));
        for (const it of items) {
          const u = byId.get(String(it.ownerId));
          if (u) {
            const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
            it.ownerName = full || u.email || String(u._id);
            it.ownerEmail = u.email || undefined;
          }
        }
      }
    } catch (_) {
      // Non-fatal; continue without ownerName
    }

    return res.json({ success: true, data: items, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error listando barcos', error: error.message });
  }
};

// POST /api/admin/boats/:id/approve
exports.approveBoat = async (req, res) => {
  try {
    const { id } = req.params;
    const boat = await Boat.findById(id);
    if (!boat) return res.status(404).json({ success: false, message: 'Barco no encontrado' });
    if (boat.status !== 'pending_review') {
      return res.status(400).json({ success: false, message: 'El barco no está en revisión' });
    }
    boat.status = 'approved';
    boat.reviewedAt = new Date();
    boat.reviewedBy = req.user?._id;
    boat.reviewNotes = undefined;
    boat.audit = boat.audit || [];
    boat.audit.push({ action: 'approve', by: req.user?._id, at: new Date() });
    const saved = await boat.save();
    return res.json({ success: true, message: 'Barco aprobado', data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al aprobar barco', error: error.message });
  }
};

// POST /api/admin/boats/:id/reject { notes }
exports.rejectBoat = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body || {};
    const boat = await Boat.findById(id);
    if (!boat) return res.status(404).json({ success: false, message: 'Barco no encontrado' });
    if (boat.status !== 'pending_review') {
      return res.status(400).json({ success: false, message: 'El barco no está en revisión' });
    }
    boat.status = 'rejected';
    boat.reviewedAt = new Date();
    boat.reviewedBy = req.user?._id;
    boat.reviewNotes = typeof notes === 'string' ? notes : undefined;
    boat.audit = boat.audit || [];
    boat.audit.push({ action: 'reject', by: req.user?._id, at: new Date(), notes: boat.reviewNotes });
    const saved = await boat.save();
    return res.json({ success: true, message: 'Barco rechazado', data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al rechazar barco', error: error.message });
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
