const express = require('express');
const { verifyJWT, requireAdmin } = require('../middleware/auth');
const { listLicenseRequests, approveLicense, rejectLicense } = require('../controllers/adminController');

const router = express.Router();

router.use(verifyJWT, requireAdmin);

router.get('/license-requests', listLicenseRequests);
router.post('/license-requests/:id/approve', approveLicense);
router.post('/license-requests/:id/reject', rejectLicense);

module.exports = router;
