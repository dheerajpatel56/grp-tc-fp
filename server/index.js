const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 3. Static Files
app.use(express.static(path.join(__dirname, '../client')));

// 4. Catch-all Fallback (Serve login page for any other route)
app.use((req, res) => {
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
