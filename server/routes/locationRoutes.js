const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const auth = require('../middleware/auth');

router.post('/update', auth, locationController.updateLocation);
router.get('/group/:groupId', auth, locationController.getGroupLocations);
router.get('/history/:userId', auth, locationController.getLocationHistory);

module.exports = router;
