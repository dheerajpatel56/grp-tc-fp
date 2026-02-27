const { createClerkClient } = require('@clerk/clerk-sdk-node');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const clerkAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Fallback for current frontend if it's still using the old JWT system
            // We might want to keep this for a while or force migration
            return next();
        }

        const token = authHeader.split(' ')[1];

        // 1. Try local JWT first
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded) {
                // Fetch full user from DB to match Clerk's behavior
                const [localUsers] = await db.query('SELECT id, username, email, role FROM users WHERE id = ?', [decoded.id]);
                if (localUsers.length > 0) {
                    req.user = localUsers[0];
                    console.log('Local JWT Auth Success. User:', JSON.stringify(req.user));
                    return next();
                }
            }
        } catch (jwtErr) {
            // Not a valid local JWT, continue to Clerk
            console.log('Not a valid local JWT, checking Clerk...');
        }

        // 2. Verify the token with Clerk
        const requestState = await clerkClient.authenticateRequest(req, {
            publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        if (!requestState.isSignedIn) {
            return res.status(401).json({ message: 'Unauthorized: Invalid session' });
        }

        const clerkUserId = requestState.toAuth().userId;
        const clerkUser = await clerkClient.users.getUser(clerkUserId);
        const email = clerkUser.emailAddresses[0].emailAddress;

        // Sync with local DB
        let [localUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        let localUser;

        if (localUsers.length === 0) {
            // Auto-register Clerk users
            const username = clerkUser.username || clerkUser.firstName || email.split('@')[0];
            const [result] = await db.query(
                'INSERT INTO users (username, email, role) VALUES (?, ?, ?)',
                [username, email, 'user']
            );
            localUser = { id: result.insertId, username, email, role: 'user' };
            console.log(`Auto-registered Clerk user: ${email}`);
        } else {
            localUser = localUsers[0];
        }

        req.user = localUser;
        console.log('Clerk Auth Success. Local User:', JSON.stringify(req.user));
        next();
    } catch (err) {
        console.error('Clerk Auth Middleware Error:', err);
        res.status(401).json({ message: 'Unauthorized', error: err.message });
    }
};

module.exports = clerkAuth;
