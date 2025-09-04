const express = require('express');
const router = express.Router();
const { contactOwner } = require('../controllers/messagesController');

// Contact owner of a boat
router.post('/contact-owner', contactOwner);

module.exports = router;
