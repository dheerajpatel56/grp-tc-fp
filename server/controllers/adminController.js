const db = require('../config/db');

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, email, role, created_at FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllGroups = async (req, res) => {
    try {
        const [groups] = await db.query('SELECT g.*, u.username as creator_name FROM `groups` g JOIN users u ON g.creator_id = u.id');
        res.json(groups);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.blockUser = async (req, res) => {
    // Basic implementation: we could add an 'is_blocked' column, but for now we'll just delete them
    const { userId } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ message: 'User deleted/blocked' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteGroup = async (req, res) => {
    const { groupId } = req.params;
    try {
        await db.query('DELETE FROM `groups` WHERE id = ?', [groupId]);
        res.json({ message: 'Group deleted by admin' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
