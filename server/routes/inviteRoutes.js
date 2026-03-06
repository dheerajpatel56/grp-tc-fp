const express = require('express');
const router = express.Router();
const inviteController = require('../controllers/inviteController');
const auth = require('../middleware/auth');

router.post('/send', auth, inviteController.sendInvite);
router.get('/pending', auth, inviteController.getPendingInvites);
router.post('/respond', auth, inviteController.respondToInvite);

module.exports = router;
