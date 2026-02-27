const db = require('../config/db');
const notificationController = require('./notificationController');

exports.createGroup = async (req, res) => {
    const { name } = req.body;
    const groupCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
        const [result] = await db.query('INSERT INTO `groups` (name, group_code, creator_id) VALUES (?, ?, ?)', [name, groupCode, req.user.id]);
        const groupId = result.insertId;

        // Auto join creator
        await db.query('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [groupId, req.user.id]);

        res.status(201).json({ message: 'Group created successfully', group: { id: groupId, name, groupCode } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.joinGroup = async (req, res) => {
    const { groupCode } = req.body;
    try {
        const [groups] = await db.query('SELECT * FROM `groups` WHERE group_code = ?', [groupCode]);
        if (groups.length === 0) return res.status(404).json({ message: 'Group not found' });

        const group = groups[0];
        const [existingMember] = await db.query('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?', [group.id, req.user.id]);
        if (existingMember.length > 0) return res.status(400).json({ message: 'Already a member' });

        await db.query('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [group.id, req.user.id]);

        // Notify creator
        await notificationController.createNotification(group.creator_id, group.id, `${req.user.username} joined your group ${group.name}`, 'info');

        res.json({ message: 'Joined group successfully', group });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMyGroups = async (req, res) => {
    try {
        const [groups] = await db.query(`
            SELECT g.* FROM \`groups\` g 
            JOIN group_members gm ON g.id = gm.group_id 
            WHERE gm.user_id = ?`, [req.user.id]);
        res.json(groups);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getGroupMembers = async (req, res) => {
    const { groupId } = req.params;
    try {
        const [members] = await db.query(`
            SELECT u.id, u.username, u.email, u.role FROM users u 
            JOIN group_members gm ON u.id = gm.user_id 
            WHERE gm.group_id = ?`, [groupId]);
        res.json(members);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteGroup = async (req, res) => {
    const { groupId } = req.params;
    try {
        const [groups] = await db.query('SELECT * FROM `groups` WHERE id = ?', [groupId]);
        if (groups.length === 0) return res.status(404).json({ message: 'Group not found' });

        if (groups[0].creator_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only creator can delete this group' });
        }

        // Cleanup members first (if not cascading)
        await db.query('DELETE FROM group_members WHERE group_id = ?', [groupId]);
        await db.query('DELETE FROM `groups` WHERE id = ?', [groupId]);

        res.json({ message: 'Group deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.removeMember = async (req, res) => {
    const { groupId, memberId } = req.params;
    try {
        const [groups] = await db.query('SELECT * FROM `groups` WHERE id = ?', [groupId]);
        if (groups.length === 0) return res.status(404).json({ message: 'Group not found' });

        const group = groups[0];
        if (group.creator_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only group creators can remove members' });
        }

        if (parseInt(memberId) === group.creator_id) {
            return res.status(400).json({ message: 'Creators cannot remove themselves. Delete the group instead.' });
        }

        await db.query('DELETE FROM group_members WHERE group_id = ? AND user_id = ?', [groupId, memberId]);

        // Notify the user
        await notificationController.createNotification(memberId, groupId, `You have been removed from the group: ${group.name}`, 'warning');

        res.json({ message: 'Member removed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
