const { createClerkClient } = require('@clerk/clerk-sdk-node');
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

        // Verify the token with Clerk
        // Note: For Clerk, usually the frontend sends the Session Token
        const requestState = await clerkClient.authenticateRequest(req, {
            publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        if (!requestState.isSignedIn) {
            return res.status(401).json({ message: 'Unauthorized: Invalid Clerk session' });
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
        next();
    } catch (err) {
        console.error('Clerk Auth Middleware Error:', err);
        res.status(401).json({ message: 'Unauthorized', error: err.message });
    }
};

module.exports = clerkAuth;
