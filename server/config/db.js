const mysql = require('mysql2');
require('dotenv').config();

console.log('--- Database Config Debug ---');
console.log('DB_HOST:', process.env.DB_HOST ? `${process.env.DB_HOST.substring(0, 5)}...` : 'MISSING');
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('----------------------------');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed!');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
        console.error('Full Error:', err);
    } else {
        console.log('Database connected successfully');
        connection.release();
    }
});

module.exports = pool.promise();
