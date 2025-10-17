const Boat = require('../models/Boat');
const User = require('../models/User');
const Review = require('../models/Review');

// Validations
const currentYear = new Date().getFullYear();
const phoneRegex = /^[+]?\d[\d\s()-]{6,}$/;

const validateBoatPayload = (b) => {
  const required = [
    'name','rentalTypes','boatType','brand','model','buildYear','capacity','enginePower','length','contactNumber','city','description','price','priceUnit','photos',
    // geolocalización
    'latitude','longitude','addressFormatted'
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
  // Validación de coordenadas
  const lat = Number(b.latitude);
  const lon = Number(b.longitude);
  if (Number.isNaN(lat) || lat < -90 || lat > 90) return 'Latitud inválida';
  if (Number.isNaN(lon) || lon < -180 || lon > 180) return 'Longitud inválida';
  if (!phoneRegex.test(String(b.contactNumber))) return 'Número de contacto inválido';
  return null;
};

// POST /api/boats/:id/submit
// Cambia estado de draft|rejected -> pending_review (solo dueño)
exports.submitForReview = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'No autorizado' });
    const boat = await Boat.findById(req.params.id);
    if (!boat) return res.status(404).json({ success: false, message: 'Embarcación no encontrada' });
    if (String(boat.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para este barco' });
    }
    if (!['draft','rejected'].includes(boat.status)) {
      return res.status(400).json({ success: false, message: 'El barco no puede enviarse en su estado actual' });
    }

    // Validar mínimos antes de enviar
    const validationError = validateBoatPayload(boat.toObject());
    if (validationError) return res.status(400).json({ success: false, message: `Faltan datos: ${validationError}` });

    boat.status = 'pending_review';
    boat.submittedAt = new Date();
    boat.reviewNotes = undefined;
    boat.audit = boat.audit || [];
    boat.audit.push({ action: 'submit', by: req.user._id, at: new Date() });
    const saved = await boat.save();
    return res.json({ success: true, message: 'Enviado a validación', data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error enviando a validación', error: error.message });
  }
};

// GET /api/boats/:id/reviews?page=1&limit=10
exports.listBoatReviews = async (req, res) => {
  try {
    const boatId = req.params.id;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '10', 10)));

    // total y promedio
    const [agg] = await Review.aggregate([
      { $match: { boatId: new (require('mongoose')).Types.ObjectId(boatId) } },
      { $group: { _id: '$boatId', average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const average = agg?.average ? Number(agg.average.toFixed(2)) : 0;
    const count = agg?.count || 0;

    // items paginados, con datos mínimos del usuario
    const items = await Review.find({ boatId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // opcional: hidratar con nombre de usuario
    const userIds = Array.from(new Set(items.map(r => String(r.userId)).filter(Boolean)));
    const usersById = {};
    if (userIds.length) {
      const users = await User.find({ _id: { $in: userIds } }).select('firstName lastName').lean();
      for (const u of users) {
        usersById[String(u._id)] = u;
      }
    }
    const data = items.map((r) => {
      const u = usersById[String(r.userId)];
      const name = u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'Usuario';
      return {
        id: String(r._id),
        userId: String(r.userId),
        user: name,
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt,
      };
    });

    return res.json({
      success: true,
      data,
      meta: { page, limit, total: count, pages: Math.ceil(count / limit || 1) },
      summary: { average, count },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error obteniendo reseñas', error: error.message });
  }
};

// GET /api/boats/:id/conditions
exports.getBoatConditions = async (req, res) => {
  try {
    const boat = await Boat.findById(req.params.id).lean();
    if (!boat || !boat.isActive || boat.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Embarcación no encontrada' });
    }
    const c = boat.rentalConditions || {};
    
    
    const mapToFrontend = {
      solo_barco: 'boat_only',
      con_capitan: 'with_captain',
      con_dueno: 'owner_onboard',
    };
    const allowedRentalTypes = (boat.rentalTypes || [])
      .map(rt => mapToFrontend[rt])
      .filter(Boolean);
    
    return res.json({ success: true, data: { ...c, allowedRentalTypes } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error obteniendo condiciones de alquiler', error: error.message });
  }
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
      latitude: payload.latitude !== undefined ? Number(payload.latitude) : boat.latitude,
      longitude: payload.longitude !== undefined ? Number(payload.longitude) : boat.longitude,
      addressFormatted: payload.addressFormatted !== undefined ? String(payload.addressFormatted) : boat.addressFormatted,
      allowsFlexibleCancellation: typeof payload.allowsFlexibleCancellation === 'boolean' ? payload.allowsFlexibleCancellation : boat.allowsFlexibleCancellation,
    });

    // Mantener GeoJSON location sincronizado
    if (typeof boat.longitude === 'number' && typeof boat.latitude === 'number') {
      boat.location = {
        type: 'Point',
        coordinates: [boat.longitude, boat.latitude], // [lon, lat]
      };
    }

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

// GET /api/boats/near?north=&south=&east=&west=&limit=100
// Devuelve embarcaciones activas dentro de un bounding box (rectángulo del mapa)
exports.listBoatsNear = async (req, res) => {
  try {
    const north = Number(req.query.north);
    const south = Number(req.query.south);
    const east = Number(req.query.east);
    const west = Number(req.query.west);
    if ([north, south, east, west].some((v) => Number.isNaN(v))) {
      return res.status(400).json({ success: false, message: 'Parámetros inválidos: north, south, east, west son requeridos' });
    }
    if (north < -90 || north > 90 || south < -90 || south > 90 || east < -180 || east > 180 || west < -180 || west > 180) {
      return res.status(400).json({ success: false, message: 'Rangos de coordenadas inválidos' });
    }

    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit || '100', 10)));

    const items = await Boat.find({
      isActive: true,
      status: 'approved',
      location: {
        $geoWithin: {
          $box: [[west, south], [east, north]],
        },
      },
    })
      .limit(limit)
      .lean();

    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error en búsqueda geoespacial', error: error.message });
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
      latitude: Number(payload.latitude),
      longitude: Number(payload.longitude),
      addressFormatted: String(payload.addressFormatted),
      isActive: true,
      allowsFlexibleCancellation: Boolean(payload.allowsFlexibleCancellation) || false,
    });

    // Asignar GeoJSON location desde lat/lng
    boat.location = {
      type: 'Point',
      coordinates: [boat.longitude, boat.latitude],
    };

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

    // Optional filter by owner (for "otras publicaciones del propietario")
    const filter = { isActive: true, status: 'approved' };
    if (req.query.owner) {
      filter.ownerId = req.query.owner;
    }

    const total = await Boat.countDocuments(filter);
    const items = await Boat.find(filter)
      .sort({ [sort]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Batch enrich with ownerName and ownerAvatar
    const ownerIds = Array.from(new Set(items.map(b => String(b.ownerId)).filter(Boolean)));
    const ownersById = {};
    if (ownerIds.length) {
      const owners = await User.find({ _id: { $in: ownerIds } }).select('firstName lastName avatar rating').lean();
      for (const o of owners) {
        ownersById[String(o._id)] = o;
      }
    }
    const enriched = items.map((b) => {
      const o = ownersById[String(b.ownerId)];
      const first = o?.firstName || '';
      const last = o?.lastName || '';
      const ownerName = `${first} ${last}`.trim() || undefined;
      const ownerAvatar = o?.avatar || undefined;
      const ownerRating = typeof o?.rating === 'number' ? o.rating : undefined;
      return { ...b, ownerName, ownerAvatar, ownerRating };
    });

    return res.json({ success: true, data: enriched, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error obteniendo embarcaciones', error: error.message });
  }
};

// GET /api/boats/:id (público)
exports.getBoatPublic = async (req, res) => {
  try {
    const boat = await Boat.findById(req.params.id).lean();
    if (!boat || !boat.isActive || boat.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Embarcación no encontrada' });
    }
    // Enriquecer con datos del propietario
    let ownerName;
    let ownerRating;
    let ownerAvatar;
    try {
      const owner = await User.findById(boat.ownerId).lean();
      if (owner) {
        const first = owner.firstName || '';
        const last = owner.lastName || '';
        ownerName = `${first} ${last}`.trim();
        ownerRating = typeof owner.rating === 'number' ? owner.rating : undefined;
        ownerAvatar = owner.avatar || undefined;
      }
    } catch (_) {
      // no-op si falla lookup del usuario
    }
    return res.json({ success: true, data: { ...boat, ownerName, ownerRating, ownerAvatar } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error obteniendo embarcación', error: error.message });
  }
};
