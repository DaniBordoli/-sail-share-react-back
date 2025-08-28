const express = require('express');
const { verifyJWT, requireAdmin } = require('../middleware/auth');
const { listLicenseRequests, approveLicense, rejectLicense, listBoats, approveBoat, rejectBoat } = require('../controllers/adminController');

const router = express.Router();

router.use(verifyJWT, requireAdmin);

router.get('/license-requests', listLicenseRequests);
router.post('/license-requests/:id/approve', approveLicense);
router.post('/license-requests/:id/reject', rejectLicense);

// Boats review workflow
router.get('/boats', listBoats);
router.post('/boats/:id/approve', approveBoat);
router.post('/boats/:id/reject', rejectBoat);

module.exports = router;
