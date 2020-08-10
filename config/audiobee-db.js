const mysql = require("mysql");

var pool = mysql.createPool({
    host: "13.49.25.172",
    // host: "localhost",
    // user: "root",
    // password: "",
    port: "3306",
    user: "production",
    password: "production",
    database: "audio-bee-webapp-db",
    supportBigNumbers: true
});


module.exports = pool;