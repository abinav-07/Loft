const mysql = require("mysql");

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
    host: "13.49.25.172",
    port: "3306",
    user: "dikson",
    password: "password",
    database: "audio-bee-transcribe-test",
    supportBigNumbers: true
});

module.exports = pool;