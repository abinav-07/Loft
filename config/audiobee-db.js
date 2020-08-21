const mysql = require("mysql");
var dotenv = require("dotenv");
dotenv.config();
var pool = mysql.createPool({
  port: process.env.MYSQL_PORT,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DBNAME_AUDIOBEE_DB,
  supportBigNumbers: true,
});

module.exports = pool;
