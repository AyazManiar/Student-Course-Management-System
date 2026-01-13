require('dotenv').config();
const db = require("./config/db.js");

console.log('Environment variables:');
console.log('db_host:', process.env.db_host);
console.log('db_user:', process.env.db_user);
console.log('db_pass:', process.env.db_pass);
console.log('db_name:', process.env.db_name);

async function testDB() {
    try {
        console.log('\nTesting database connection...');
        const [rows] = await db.query("SELECT * FROM departments");
        console.log('Success! Departments:', rows);
        process.exit(0);
    } catch (error) {
        console.error('Database error:', error.message);
        process.exit(1);
    }
}

testDB();
