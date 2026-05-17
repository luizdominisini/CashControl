const mysql = require("mysql");

module.exports = function (app) {
  const db_configs = {
    host: app.settings.configs.MARIADB_HOST,
    port: app.settings.configs.MARIADB_PORT,
    user: app.settings.configs.MARIADB_USER,
    password: app.settings.configs.MARIADB_PASSWORD,
    database: app.settings.configs.MARIADB_DATABASE,
    connectionLimit: app.settings.configs.DB_CONNECTIONS,
  };

  let pool = mysql.createPool(db_configs);

  let get_connection = function (callback) {
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log("Error getting connection: ", err);
        callback(err, null);
      } else {
        callback(null, connection);
      }
    });
  };

  for (let i = 0; i < app.settings.configs.DB_CONNECTIONS; i++) {
    get_connection(function (err, connection) {
      if (err) {
        console.log("Error getting connection: ", err);
      } else {
        console.log("[MYSQL] connection #" + (i + 1) + " established");
        connection.release();
      }
    });
  }

  return get_connection;
};
