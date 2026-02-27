const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDb() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const [users] = await connection.execute('SELECT * FROM users;');
        console.log('Users:', JSON.stringify(users, null, 2));

        const [groups] = await connection.execute('SELECT * FROM `groups`;');
        console.log('Groups:', JSON.stringify(groups, null, 2));

        const [members] = await connection.execute('SELECT * FROM group_members;');
        console.log('Group Members:', JSON.stringify(members, null, 2));

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await connection.end();
    }
}

checkDb();
