const luxon = require("luxon");

const ct_counter = new Map();
function CheckUpdateControllerInfo(ct_counter, request, controller_name) {
  try {
    const current_time = luxon.DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss");

    if (!ct_counter.has(controller_name)) {
      ct_counter.set(controller_name, {
        count: 1,
        last_update: current_time,
      });
    } else {
      const ct_info = ct_counter.get(controller_name);
      ct_info.count += 1;
      ct_info.last_update = current_time;

      ct_counter.set(controller_name, ct_info);
    }

    const ct_info = ct_counter.get(controller_name);

    // se o contador ultrapassar 1000, reseta para evitar overflow
    if (ct_info.count > 1000) {
      ct_info.count = 0;
      ct_counter.set(controller_name, ct_info);
    }

    console.log(
      `${current_time} - Controller: ${controller_name} - Count: ${ct_info.count}`,
    );
  } catch (error) {
    console.log("[TRY-CATCH ERROR] routes::rt_dino error: ", error);
  }
}

module.exports = function (app) {
  const api_path = app.settings.configs.api_path;

  //+-----------------------------------------------------------+
  //| POST /costs/create                                        |
  //+-----------------------------------------------------------+
  app.post(`/${api_path}/costs/create`, (request, response) => {
    CheckUpdateControllerInfo(ct_counter, request, "createCost");
    app.controllers.costs.ct_costs.createCost(app, request, response);
  });

  //+-----------------------------------------------------------+
  //| POST /costs/list                                          |
  //+-----------------------------------------------------------+
  app.get(`/${api_path}/costs/list`, (request, response) => {
    CheckUpdateControllerInfo(ct_counter, request, "listCosts");
    app.controllers.costs.ct_costs.listCosts(app, request, response);
  });
};
