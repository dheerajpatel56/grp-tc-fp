const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Simple role check middleware
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    next();
};

router.get('/users', auth, adminOnly, adminController.getAllUsers);
router.get('/groups', auth, adminOnly, adminController.getAllGroups);
router.delete('/users/:userId', auth, adminOnly, adminController.blockUser);
router.delete('/groups/:groupId', auth, adminOnly, adminController.deleteGroup);

module.exports = router;
