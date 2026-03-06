const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const clerkAuth = require('./middleware/clerkAuth');
app.use(clerkAuth);

// Automated Database Migration
const db = require('./config/db');
(async () => {
    try {
        console.log('Running automated migration...');
        await db.query('ALTER TABLE users MODIFY password VARCHAR(255) NULL;');

        await db.query(`
            CREATE TABLE IF NOT EXISTS invites (
                id INT AUTO_INCREMENT PRIMARY KEY,
                group_id INT,
                inviter_id INT,
                invitee_id INT,
                status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_invite (group_id, invitee_id),
                FOREIGN KEY (group_id) REFERENCES \`groups\`(id) ON DELETE CASCADE,
                FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (invitee_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        console.log('Migration successful or already applied.');
    } catch (err) {
        console.error('Migration failed (not critical if already applied):', err.message);
    }
})();

// 1. Health Check Endpoint (Must be first to avoid static match)
app.get('/api/health', async (req, res) => {
    console.log('Health check requested');
    try {
        const db = require('./config/db');
        const [result] = await db.query('SELECT 1 as connected');
        console.log('Health check DB success:', result);
        res.json({
            status: 'OK',
            database: 'Connected',
            time: new Date().toISOString()
        });
    } catch (err) {
        console.error('Health check DB error:', err);
        res.status(500).json({
            status: 'Error',
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// 2. API Routes
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const locationRoutes = require('./routes/locationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const inviteRoutes = require('./routes/inviteRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/invites', inviteRoutes);

// 3. Static Files
app.use(express.static(path.join(__dirname, '../client')));

// 4. Catch-all Fallback (Serve login page for any other route)
app.use((req, res) => {
    if (req.path.startsWith('/api') || req.path.includes('.')) {
        return res.status(404).json({ message: `Path not found: ${req.path}` });
    }
    console.log(`Fallback hit for: ${req.method} ${req.path}`);
    res.sendFile(path.join(__dirname, '../client/login.html'));
});


const PORT = process.env.PORT || 5000;


const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
});
