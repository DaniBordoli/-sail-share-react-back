const Booking = require('../models/Booking');
const Boat = require('../models/Boat');

// Utilidad para calcular noches (end exclusive)
function diffNights(startDate, endDate) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  const ms = e.getTime() - s.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

// Verificar solapamiento simple
async function hasOverlap(boatId, startDate, endDate) {
  const overlap = await Booking.findOne({
    boatId,
    status: { $ne: 'cancelled' },
    $or: [
      { startDate: { $lt: endDate }, endDate: { $gt: startDate } },
    ],
  }).lean();
  return !!overlap;
}

exports.checkAvailability = async (req, res) => {
  try {
    const { boatId } = req.params;
    const { start, end } = req.query; // opcional

    if (!boatId) return res.status(400).json({ message: 'boatId requerido' });

    if (start && end) {
      const s = new Date(String(start));
      const e = new Date(String(end));
      if (isNaN(s) || isNaN(e) || s >= e) return res.status(400).json({ message: 'Rango de fechas inválido' });
      const overlap = await hasOverlap(boatId, s, e);
      return res.json({ available: !overlap });
    }

    // listar rangos ya reservados (futuros)
    const now = new Date();
    const bookings = await Booking.find({ boatId, endDate: { $gte: now }, status: { $ne: 'cancelled' } })
      .select('startDate endDate -_id')
      .sort({ startDate: 1 })
      .lean();
    return res.json({ blocked: bookings });
  } catch (err) {
    console.error('checkAvailability error', err);
    return res.status(500).json({ message: 'Error verificando disponibilidad' });
  }
};

// Actualizar estado de una reserva (solo propietario del barco)
exports.updateBookingStatus = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: 'No autenticado' });
    const { id } = req.params;
    const { status } = req.body || {};

    const allowed = ['confirmed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const booking = await Booking.findById(id).lean();
    if (!booking) return res.status(404).json({ message: 'Reserva no encontrada' });

    const boat = await Boat.findById(booking.boatId).select('_id ownerId').lean();
    if (!boat) return res.status(404).json({ message: 'Barco no encontrado' });
    if (String(boat.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const updated = await Booking.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    ).lean();

    return res.json({ message: 'Estado actualizado', booking: updated });
  } catch (err) {
    console.error('updateBookingStatus error', err);
    return res.status(500).json({ message: 'Error actualizando estado de la reserva' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const {
      boatId,
      startDate,
      endDate,
      guests,
      extras,
      rentalType,
      flexibleCancellation,
      // nuevos campos
      contactPhone,
      hasChildren,
      sailingExperience,
      motorExperience,
      licenseType,
      ownershipExperience,
      additionalDescription,
    } = req.body;
    if (!boatId || !startDate || !endDate || !guests) {
      return res.status(400).json({ message: 'Campos requeridos: boatId, startDate, endDate, guests' });
    }

    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s) || isNaN(e) || s >= e) return res.status(400).json({ message: 'Rango de fechas inválido' });

    const boat = await Boat.findById(boatId).lean();
    if (!boat || boat.status !== 'approved' || boat.isActive !== true) {
      return res.status(400).json({ message: 'Barco no disponible para reservas' });
    }
    if (guests > (boat.capacity || 0)) {
      return res.status(400).json({ message: 'Número de huéspedes excede la capacidad' });
    }
    // Validar rentalType contra capacidades del barco
    const rt = String(rentalType || 'boat_only');
    const allowedRentalTypes = new Set(['boat_only','with_captain','owner_onboard']);
    if (!allowedRentalTypes.has(rt)) {
      return res.status(400).json({ message: 'rentalType inválido' });
    }
    // Mapear a nomenclatura del barco
    const mapToBoat = {
      boat_only: 'solo_barco',
      with_captain: 'con_capitan',
      owner_onboard: 'con_dueno',
    };
    if (Array.isArray(boat.rentalTypes) && boat.rentalTypes.length > 0) {
      const key = mapToBoat[rt];
      if (!boat.rentalTypes.includes(key)) {
        return res.status(400).json({ message: 'El barco no ofrece el tipo de rental seleccionado' });
      }
    }
    // Validar cancelación flexible
    const wantFlexible = Boolean(flexibleCancellation);
    if (wantFlexible && boat.allowsFlexibleCancellation !== true) {
      return res.status(400).json({ message: 'Este barco no permite cancelación flexible' });
    }

    const overlap = await hasOverlap(boatId, s, e);
    if (overlap) return res.status(409).json({ message: 'Fechas no disponibles' });

    const nights = diffNights(s, e);
    const base = (boat.price || 0) * nights;
    const extrasTotal = (extras?.captain ? 200 : 0) + (extras?.fuel ? 100 : 0);
    const rentalSurcharge = rt === 'with_captain' ? 200 : rt === 'owner_onboard' ? 150 : 0;
    const flexibleSurcharge = wantFlexible ? Math.round(base * 0.1) : 0;
    const totalAmount = base + extrasTotal + rentalSurcharge + flexibleSurcharge;

    // Mock de pago: generar clientSecret falso
    const mockClientSecret = `pi_mock_${Date.now()}_${Math.floor(Math.random()*10000)}`;

    const booking = await Booking.create({
      boatId,
      renterId: req.user?._id, // opcional si hay auth
      startDate: s,
      endDate: e,
      guests,
      extras: { captain: !!extras?.captain, fuel: !!extras?.fuel },
      rentalType: rt,
      flexibleCancellation: wantFlexible,
      currency: 'EUR',
      totalAmount,
      status: 'pending_payment',
      paymentIntentId: mockClientSecret,
      clientSecret: mockClientSecret,
      // nuevos campos
      contactPhone: typeof contactPhone === 'string' ? contactPhone.trim() : undefined,
      hasChildren: Boolean(hasChildren),
      sailingExperience: sailingExperience || 'none',
      motorExperience: motorExperience || 'none',
      licenseType: licenseType || undefined,
      ownershipExperience: ownershipExperience || 'none',
      additionalDescription: additionalDescription || undefined,
    });

    return res.status(201).json({
      message: 'Reserva creada',
      booking,
    });
  } catch (err) {
    console.error('createBooking error', err);
    return res.status(500).json({ message: 'Error creando reserva' });
  }
};

exports.listMyBookings = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: 'No autenticado' });
    const items = await Booking.find({ renterId: req.user._id }).sort({ createdAt: -1 }).lean();
    return res.json({ items });
  } catch (err) {
    console.error('listMyBookings error', err);
    return res.status(500).json({ message: 'Error listando reservas' });
  }
};

// Listar reservas de los barcos pertenecientes al propietario autenticado
exports.listOwnerBookings = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: 'No autenticado' });
    // Obtener IDs de barcos del propietario
    const boats = await Boat.find({ ownerId: req.user._id }).select('_id name price priceUnit photos').lean();
    const boatIds = boats.map(b => b._id);
    if (boatIds.length === 0) return res.json({ items: [] });

    // Buscar reservas de estos barcos
    const bookings = await Booking.find({ boatId: { $in: boatIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Mapear info mínima de barco
    const boatMap = new Map(boats.map(b => [String(b._id), b]));
    const items = bookings.map(bk => ({
      ...bk,
      boat: boatMap.get(String(bk.boatId)) || null,
    }));

    return res.json({ items });
  } catch (err) {
    console.error('listOwnerBookings error', err);
    return res.status(500).json({ message: 'Error listando reservas de propietario' });
  }
};

// Simular pago exitoso (solo para desarrollo/testing)
exports.simulatePayment = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: 'No autenticado' });
    const { id } = req.params;

    const booking = await Booking.findById(id).lean();
    if (!booking) return res.status(404).json({ message: 'Reserva no encontrada' });

    // Verificar que el usuario sea el dueño de la reserva (si tiene renterId)
    // Si no tiene renterId (reserva sin auth), permitir que cualquier usuario autenticado la confirme
    if (booking.renterId && String(booking.renterId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'No autorizado: esta reserva pertenece a otro usuario' });
    }

    // Solo se puede simular pago si está en pending_payment
    if (booking.status !== 'pending_payment') {
      return res.status(400).json({ message: 'La reserva ya fue procesada' });
    }

    // Actualizar a confirmed y asignar renterId si no lo tiene
    const updateData = { status: 'confirmed' };
    if (!booking.renterId) {
      updateData.renterId = req.user._id;
    }

    const updated = await Booking.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).lean();

    return res.json({ 
      message: 'Pago simulado exitoso, reserva confirmada', 
      booking: updated 
    });
  } catch (err) {
    console.error('simulatePayment error', err);
    return res.status(500).json({ message: 'Error simulando pago' });
  }
};
