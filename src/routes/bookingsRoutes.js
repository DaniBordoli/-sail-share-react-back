const express = require('express');
const router = express.Router();

const { checkAvailability, createBooking, listMyBookings, listOwnerBookings, updateBookingStatus } = require('../controllers/bookingsController');
const { verifyJWT } = require('../middleware/auth');

// GET /api/bookings/availability/:boatId?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/availability/:boatId', checkAvailability);

// POST /api/bookings
router.post('/', createBooking);

// GET /api/bookings/mine
router.get('/mine', verifyJWT, listMyBookings);

// GET /api/bookings/owner -> reservas de los barcos del propietario autenticado
router.get('/owner', verifyJWT, listOwnerBookings);

// PUT /api/bookings/:id/status -> actualizar estado (confirm/cancel) por propietario
router.put('/:id/status', verifyJWT, updateBookingStatus);

module.exports = router;
