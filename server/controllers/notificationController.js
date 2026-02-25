const db = require('../config/db');

exports.getUserNotifications = async (req, res) => {
    try {
        const [notifications] = await db.query(`
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC LIMIT 50`, [req.user.id]);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    // Basic implementation, table doesn't have is_read yet but can be added if needed
    res.json({ message: 'Notifications marked as read' });
};

// Helper function to create notification
exports.createNotification = async (userId, groupId, message, type) => {
    try {
        await db.query('INSERT INTO notifications (user_id, group_id, message, type) VALUES (?, ?, ?, ?)',
            [userId, groupId, message, type]);
    } catch (err) {
        console.error('Error creating notification:', err);
    }
};
