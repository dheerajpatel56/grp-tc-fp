const db = require('../config/db');
const notificationController = require('./notificationController');

exports.updateLocation = async (req, res) => {
    const { latitude, longitude } = req.body;
    const userId = req.user.id;
    try {
        // Update live location
        await db.query(`
            INSERT INTO live_locations (user_id, latitude, longitude) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE latitude = ?, longitude = ?, updated_at = CURRENT_TIMESTAMP`,
            [userId, latitude, longitude, latitude, longitude]
        );

        // Store in history
        await db.query('INSERT INTO location_history (user_id, latitude, longitude) VALUES (?, ?, ?)', [userId, latitude, longitude]);

        // Geofencing Alert (Demo: notify if far from lat:0, lng:0)
        const center = { lat: 0, lng: 0 };
        const distance = Math.sqrt(Math.pow(latitude - center.lat, 2) + Math.pow(longitude - center.lng, 2)) * 111;
        if (distance > 50) {
            await notificationController.createNotification(userId, null, 'Alert: You have moved out of the defined radius!', 'warning');
        }

        res.json({ message: 'Location updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getGroupLocations = async (req, res) => {
    const { groupId } = req.params;
    try {
        const [locations] = await db.query(`
            SELECT u.id, u.username, l.latitude, l.longitude, l.updated_at 
            FROM users u
            JOIN group_members gm ON u.id = gm.user_id
            JOIN live_locations l ON u.id = l.user_id
            WHERE gm.group_id = ?`, [groupId]);
        res.json(locations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getLocationHistory = async (req, res) => {
    const { userId } = req.params;
    const { date } = req.query;
    try {
        const [history] = await db.query(`
            SELECT * FROM location_history 
            WHERE user_id = ? AND DATE(created_at) = ?
            ORDER BY created_at ASC`, [userId, date]);
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
