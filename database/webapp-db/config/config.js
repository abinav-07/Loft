const dotenv = require('dotenv');
dotenv.config();
var { port, host, user, password, database } = {
  port: process.env.MYSQL_PORT,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DBNAME_AUDIOBEE_DB,
};

module.exports = {
  development: {
    username: user,
    password,
    database,
    host,
    port,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true,
    },
    logging: false,
  },
  production: {
    username: user,
    password,
    database,
    host,
    port,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true,
    },
    logging: false,
  },
};
