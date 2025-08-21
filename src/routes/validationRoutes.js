const express = require('express');
const multer = require('multer');
const { verifyJWT } = require('../middleware/auth');
const { uploadLicense } = require('../controllers/validationController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Subida de licencia (protegido)
// Field name esperado: 'file'
router.post('/license', verifyJWT, upload.single('file'), uploadLicense);

module.exports = router;
