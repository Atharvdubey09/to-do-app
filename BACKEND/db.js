const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "auth_app",
  password: "atharv@09",
  port: 5432,
});
module.exports = pool;

