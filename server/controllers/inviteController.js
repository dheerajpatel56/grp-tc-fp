const db = require('../config/db');
const notificationController = require('./notificationController');

exports.sendInvite = async (req, res) => {
    const { groupId, username } = req.body;
    try {
        // Find user by username
        const [users] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        const inviteeId = users[0].id;

        if (inviteeId === req.user.id) return res.status(400).json({ message: 'You cannot invite yourself' });

        // Check if already a member
        const [existingMember] = await db.query('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?', [groupId, inviteeId]);
        if (existingMember.length > 0) return res.status(400).json({ message: 'User is already a member of this group' });

        // Check if an invite already exists
        const [existingInvite] = await db.query('SELECT * FROM invites WHERE group_id = ? AND invitee_id = ? AND status = "pending"', [groupId, inviteeId]);
        if (existingInvite.length > 0) return res.status(400).json({ message: 'An invitation is already pending for this user' });

        // Create invite
        await db.query('INSERT INTO invites (group_id, inviter_id, invitee_id) VALUES (?, ?, ?)', [groupId, req.user.id, inviteeId]);

        // Get group name for notification
        const [groups] = await db.query('SELECT name FROM `groups` WHERE id = ?', [groupId]);
        const groupName = groups[0].name;

        // Notify user
        await notificationController.createNotification(inviteeId, groupId, `${req.user.username} invited you to join "${groupName}"`, 'info');

        res.status(201).json({ message: 'Invitation sent successfully' });
    } catch (err) {
        console.error('Send Invite Error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.getPendingInvites = async (req, res) => {
    try {
        const [invites] = await db.query(`
            SELECT i.*, g.name as group_name, u.username as inviter_name 
            FROM invites i 
            JOIN \`groups\` g ON i.group_id = g.id 
            JOIN users u ON i.inviter_id = u.id 
            WHERE i.invitee_id = ? AND i.status = 'pending'`, [req.user.id]);
        res.json(invites);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.respondToInvite = async (req, res) => {
    const { inviteId, response } = req.body; // response: 'accepted' or 'declined'
    if (!['accepted', 'declined'].includes(response)) {
        return res.status(400).json({ message: 'Invalid response status' });
    }

    try {
        const [invites] = await db.query('SELECT * FROM invites WHERE id = ? AND invitee_id = ?', [inviteId, req.user.id]);
        if (invites.length === 0) return res.status(404).json({ message: 'Invitation not found' });

        const invite = invites[0];

        if (response === 'accepted') {
            // Add to group_members
            await db.query('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [invite.group_id, req.user.id]);
        }

        // Update invite status
        await db.query('UPDATE invites SET status = ? WHERE id = ?', [response, inviteId]);

        res.json({ message: `Invitation ${response}` });
    } catch (err) {
        console.error('Respond to Invite Error:', err);
        res.status(500).json({ message: err.message });
    }
};
