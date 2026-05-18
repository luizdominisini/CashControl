const express = require("express");
const consign = require("consign");
const cors = require("cors");

const app = express();

let gl_configs = {};
const config_files = ["mariadb-configs.json"];

(async () => {
  let configs_dir = null;

  if (!process.env.NODE_ENV || process.env.NODE_ENV == "DEV") {
    //dev_configs
    configs_dir = "dev_configs";

    gl_configs.SERVER_PORT = process.env.SERVER_PORT || 3000;
    gl_configs.NODE_ENV = process.env.NODE_ENV || "DEV";
    gl_configs.api_path = process.env.api_path || "v0";
  } else {
    //prd_configs
    configs_dir = "prd_configs";

    gl_configs.SERVER_PORT = process.env.SERVER_PORT || 3000;
    gl_configs.NODE_ENV = process.env.NODE_ENV || "PRD";
    gl_configs.api_path = process.env.api_path || "v1";
  }

  //
  for (const file of config_files) {
    //
    const this_config = require(`./${configs_dir}/${file}`);

    for (const key in this_config) {
      gl_configs[key] = this_config[key];
    }
  }

  //
  console.log("gl_configs: ", gl_configs);

  // set global
  app.set("configs", gl_configs);
  app.use(cors());
  app.use(express.json());

  // autoload routes, controllers, models, configs
  consign()
    .include("config/mysql.js")
    .include("routes")
    .include("controllers")
    .include("models")
    .into(app);
})();

module.exports = app;
