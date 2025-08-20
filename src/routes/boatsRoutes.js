const express = require('express');
const { verifyJWT } = require('../middleware/auth');
const { getMyBoats, createBoat, updateBoat, deleteBoat, toggleActive, listPublicBoats, getBoatPublic } = require('../controllers/boatsController');

const router = express.Router();

// Públicos
router.get('/', listPublicBoats);

// Requiere autenticación (debe ir antes del paramétrico :id para no colisionar)
router.get('/mine', verifyJWT, getMyBoats);
router.post('/', verifyJWT, createBoat);
router.put('/:id', verifyJWT, updateBoat);
router.delete('/:id', verifyJWT, deleteBoat);
router.patch('/:id/status', verifyJWT, toggleActive);

// Público por id (después de '/mine')
router.get('/:id', getBoatPublic);

module.exports = router;
