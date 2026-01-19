const mysql = require("mysql2")

const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "ayaz",
    password: "0000",
    database: "stud_mgmt_sys",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 2,
    port: 3306
})

// Test database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('[Database] Connection failed:', err.message)
        console.error('[Database] Error code:', err.code)
        process.exit(1)
    }
    console.log('[Database] Connected successfully to MySQL')
    console.log('[Database] Database:', 'stud_mgmt_sys')
    connection.release()
})

module.exports = pool.promise()