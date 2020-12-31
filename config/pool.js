const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config();
// var pool = mysql.createPool({
//     host: "remotemysql.com",
//     user: "iGDKuaofUU",
//     password: "HiBZbRcSQs",
//     database: "iGDKuaofUU"
// })

// var pool = mysql.createPool({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "nodemysql"
// })
var pool = mysql.createPool({
    port: process.env.MYSQL_PORT,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DBNAME_TRANSCRIBE_DB,
    supportBigNumbers: true,
});
pool.getConnection((err, connect) => {
    if (err) {
        console.error(err);
        
    }
    console.log("Connected");
    connect.release();
});

module.exports = pool;