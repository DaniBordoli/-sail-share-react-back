const express = require('express');
const mongoose = require('mongoose');
const { verifyJWT } = require('../middleware/auth');
const Review = require('../models/Review');
const Boat = require('../models/Boat');

const router = express.Router();

// Crear una reseña
// POST /api/reviews { boatId, rating, comment }
router.post('/', verifyJWT, async (req, res) => {
  try {
    const { boatId, rating, comment } = req.body || {};
    if (!boatId || !mongoose.Types.ObjectId.isValid(boatId)) {
      return res.status(400).json({ message: 'boatId inválido o faltante' });
    }
    const r = Number(rating);
    if (!r || r < 1 || r > 5) {
      return res.status(400).json({ message: 'rating inválido (1-5)' });
    }

    // Verificar que el barco existe y está aprobado/activo (opcional)
    const boat = await Boat.findById(boatId).select('_id isActive status');
    if (!boat || !boat.isActive || boat.status !== 'approved') {
      return res.status(404).json({ message: 'Embarcación no disponible para reseñas' });
    }

    const review = await Review.create({
      boatId: boat._id,
      userId: req.user._id,
      rating: r,
      comment: String(comment || ''),
    });

    return res.status(201).json({
      success: true,
      data: {
        id: String(review._id),
        boatId: String(review.boatId),
        userId: String(review.userId),
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt,
      },
    });
  } catch (error) {
    console.error('POST /api/reviews error:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Listar mis reseñas
// GET /api/reviews/mine
router.get('/mine', verifyJWT, async (req, res) => {
  try {
    const items = await Review.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Batch boat lookup for names (evitar N+1)
    const boatIds = Array.from(new Set(items.map((r) => String(r.boatId))));
    const boatsById = {};
    if (boatIds.length) {
      const boats = await Boat.find({ _id: { $in: boatIds } }).select('name').lean();
      for (const b of boats) boatsById[String(b._id)] = b;
    }

    const userName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Yo';
    const userAvatar = req.user.avatar || undefined;

    return res.json({
      items: items.map((r) => ({
        id: String(r._id),
        boatId: String(r.boatId),
        boatName: boatsById[String(r.boatId)]?.name,
        userId: String(r.userId),
        userName,
        userAvatar,
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('GET /api/reviews/mine error:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
