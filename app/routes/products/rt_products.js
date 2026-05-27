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

    console.log(`${current_time} - Controller: ${controller_name} - Count: ${ct_info.count}`);
  } catch (error) {
    console.log("[TRY-CATCH ERROR] routes::rt_dino error: ", error);
  }
}

module.exports = function (app) {
  const api_path = app.settings.configs.api_path;

  //+-----------------------------------------------------------+
  //| POST /products/create                                     |
  //+-----------------------------------------------------------+
  app.post(`/${api_path}/products/create`, (request, response) => {
    CheckUpdateControllerInfo(ct_counter, request, "createProduct");
    app.controllers.products.ct_products.createProduct(app, request, response);
  });

  //+-----------------------------------------------------------+
  //| GET /products/list                                        |
  //+-----------------------------------------------------------+
  app.get(`/${api_path}/products/list`, (request, response) => {
    CheckUpdateControllerInfo(ct_counter, request, "listProducts");
    app.controllers.products.ct_products.listProducts(app, request, response);
  });

  //+-----------------------------------------------------------+
  //| POST /products/delete                                     |
  //+-----------------------------------------------------------+
  app.post(`/${api_path}/products/delete`, (request, response) => {
    CheckUpdateControllerInfo(ct_counter, request, "listCosts");
    app.controllers.products.ct_products.deleteProduct(app, request, response);
  });

  //+-----------------------------------------------------------+
  //| POST /products/update                                     |
  //+-----------------------------------------------------------+
  app.post(`/${api_path}/products/update`, (request, response) => {
    CheckUpdateControllerInfo(ct_counter, request, "listCosts");
    app.controllers.products.ct_products.updateProduct(app, request, response);
  });
};
