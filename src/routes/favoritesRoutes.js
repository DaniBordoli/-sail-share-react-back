const express = require('express');
const mongoose = require('mongoose');
const { verifyJWT } = require('../middleware/auth');
const Boat = require('../models/Boat');
const User = require('../models/User');

const router = express.Router();

// Obtener favoritos del usuario autenticado
router.get('/', verifyJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('favorites');
    const ids = Array.isArray(user?.favorites) ? user.favorites : [];
    if (!ids.length) return res.json({ items: [] });

    const boats = await Boat.find({ _id: { $in: ids } });
    return res.json({ items: boats });
  } catch (err) {
    console.error('GET /api/favorites error:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Alternar favorito para un barco
router.post('/:boatId/toggle', verifyJWT, async (req, res) => {
  try {
    const { boatId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(boatId)) {
      return res.status(400).json({ message: 'boatId inválido' });
    }

    const boat = await Boat.findById(boatId).select('_id');
    if (!boat) return res.status(404).json({ message: 'Barco no encontrado' });

    const user = await User.findById(req.user._id).select('favorites');
    if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });

    const exists = (user.favorites || []).some((id) => String(id) === String(boatId));
    if (exists) {
      user.favorites = user.favorites.filter((id) => String(id) !== String(boatId));
      await user.save();
      return res.json({ favorited: false });
    } else {
      user.favorites = [...(user.favorites || []), boat._id];
      await user.save();
      return res.json({ favorited: true });
    }
  } catch (err) {
    console.error('POST /api/favorites/:boatId/toggle error:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
