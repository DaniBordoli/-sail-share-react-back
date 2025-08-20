const Boat = require('../models/Boat');

// Validations
const currentYear = new Date().getFullYear();
const phoneRegex = /^[+]?\d[\d\s()-]{6,}$/;

const validateBoatPayload = (b) => {
  const required = [
    'name','rentalTypes','area','boatType','brand','model','buildYear','capacity','enginePower','length','contactNumber','city','description','price','priceUnit','photos'
  ];
  for (const k of required) {
    if (b[k] === undefined || b[k] === null || (typeof b[k] === 'string' && !b[k].trim())) {
      return `Campo obligatorio faltante: ${k}`;
    }
  }
  if (!Array.isArray(b.rentalTypes) || b.rentalTypes.length === 0) return 'Selecciona al menos un tipo de rental';
  if (!['day','week'].includes(String(b.priceUnit))) return 'priceUnit inválido (day|week)';
  if (!Array.isArray(b.photos) || b.photos.length === 0) return 'Debe subir al menos una foto';

  if (Number.isNaN(Number(b.buildYear)) || b.buildYear < 1900 || b.buildYear > currentYear) return 'Año de construcción inválido';
  for (const nk of ['capacity','enginePower','length','price']) {
    const v = Number(b[nk]);
    if (Number.isNaN(v) || v <= 0) return `Campo numérico inválido o no positivo: ${nk}`;
  }
  if (!phoneRegex.test(String(b.contactNumber))) return 'Número de contacto inválido';
  return null;
};

// PUT /api/boats/:id
exports.updateBoat = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'No autorizado' });
    const boat = await Boat.findById(req.params.id);
    if (!boat) return res.status(404).json({ success: false, message: 'Embarcación no encontrada' });
    if (String(boat.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para editar esta embarcación' });
    }

    const payload = req.body || {};
    // Validación básica: si vienen campos críticos, validar
    const merged = { ...boat.toObject(), ...payload };
    const validationError = validateBoatPayload(merged);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    Object.assign(boat, {
      name: payload.name?.trim() ?? boat.name,
      rentalTypes: payload.rentalTypes ?? boat.rentalTypes,
      area: payload.area ?? boat.area,
      boatType: payload.boatType ?? boat.boatType,
      brand: payload.brand ?? boat.brand,
      model: payload.model ?? boat.model,
      buildYear: payload.buildYear !== undefined ? Number(payload.buildYear) : boat.buildYear,
      capacity: payload.capacity !== undefined ? Number(payload.capacity) : boat.capacity,
      enginePower: payload.enginePower !== undefined ? Number(payload.enginePower) : boat.enginePower,
      length: payload.length !== undefined ? Number(payload.length) : boat.length,
      contactNumber: payload.contactNumber !== undefined ? String(payload.contactNumber) : boat.contactNumber,
      city: payload.city ?? boat.city,
      description: payload.description ?? boat.description,
      price: payload.price !== undefined ? Number(payload.price) : boat.price,
      priceUnit: payload.priceUnit ?? boat.priceUnit,
      photos: payload.photos ?? boat.photos,
    });

    const saved = await boat.save();
    return res.json({ success: true, message: 'Embarcación actualizada', data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error actualizando embarcación', error: error.message });
  }
};

// DELETE /api/boats/:id
exports.deleteBoat = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'No autorizado' });
    const boat = await Boat.findById(req.params.id);
    if (!boat) return res.status(404).json({ success: false, message: 'Embarcación no encontrada' });
    if (String(boat.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para eliminar esta embarcación' });
    }
    await boat.deleteOne();
    return res.json({ success: true, message: 'Embarcación eliminada' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error eliminando embarcación', error: error.message });
  }
};

// PATCH /api/boats/:id/status { isActive: boolean }
exports.toggleActive = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'No autorizado' });
    const boat = await Boat.findById(req.params.id);
    if (!boat) return res.status(404).json({ success: false, message: 'Embarcación no encontrada' });
    if (String(boat.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para modificar esta embarcación' });
    }
    if (typeof req.body.isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive debe ser boolean' });
    }
    boat.isActive = req.body.isActive;
    const saved = await boat.save();
    return res.json({ success: true, message: 'Estado actualizado', data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error actualizando estado', error: error.message });
  }
};

// GET /api/boats/mine?page=1&limit=10&sort=createdAt&order=desc
exports.getMyBoats = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'No autorizado' });

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const sort = String(req.query.sort || 'createdAt');
    const order = String(req.query.order || 'desc').toLowerCase() === 'asc' ? 1 : -1;

    const filter = { ownerId: req.user._id };
    const total = await Boat.countDocuments(filter);
    const items = await Boat.find(filter)
      .sort({ [sort]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({ success: true, data: items, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error obteniendo embarcaciones', error: error.message });
  }
};

// POST /api/boats
exports.createBoat = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'No autorizado' });

    // Gate: requiere perfil básico completo y email verificado
    const user = req.user;
    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: 'Debes verificar tu correo antes de publicar.' });
    }
    if (!user.firstName || !user.lastName || !user.phone) {
      return res.status(400).json({ success: false, message: 'Completa tus datos personales y teléfono antes de publicar.' });
    }

    const payload = req.body || {};
    const validationError = validateBoatPayload(payload);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const boat = new Boat({
      ownerId: user._id,
      name: payload.name.trim(),
      rentalTypes: payload.rentalTypes,
      area: payload.area,
      boatType: payload.boatType,
      brand: payload.brand,
      model: payload.model,
      buildYear: Number(payload.buildYear),
      capacity: Number(payload.capacity),
      enginePower: Number(payload.enginePower),
      length: Number(payload.length),
      contactNumber: String(payload.contactNumber),
      city: payload.city,
      description: payload.description,
      price: Number(payload.price),
      priceUnit: payload.priceUnit,
      photos: payload.photos,
      isActive: true,
    });

    const saved = await boat.save();
    return res.status(201).json({ success: true, message: 'Embarcación creada', data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error creando embarcación', error: error.message });
  }
};

// GET /api/boats (público)
// Lista embarcaciones activas con paginación simple y orden por fecha desc
exports.listPublicBoats = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '12', 10)));
    const sort = String(req.query.sort || 'createdAt');
    const order = String(req.query.order || 'desc').toLowerCase() === 'asc' ? 1 : -1;

    const filter = { isActive: true };
    const total = await Boat.countDocuments(filter);
    const items = await Boat.find(filter)
      .sort({ [sort]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({ success: true, data: items, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error obteniendo embarcaciones', error: error.message });
  }
};

// GET /api/boats/:id (público)
exports.getBoatPublic = async (req, res) => {
  try {
    const boat = await Boat.findById(req.params.id).lean();
    if (!boat || !boat.isActive) {
      return res.status(404).json({ success: false, message: 'Embarcación no encontrada' });
    }
    return res.json({ success: true, data: boat });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error obteniendo embarcación', error: error.message });
  }
};
