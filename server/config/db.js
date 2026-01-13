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
module.exports = pool.promise()