const Joi = require("joi");
const MAX_UINT_32 = 4294967295;
const MAX_DECIMAL = 99999999.99;
const MIN_DECIMAL = 0.01;

//+----------------------------------------------------------------+
//| createCost                                                     |
//+----------------------------------------------------------------+
module.exports.createCost = async function (app, request, response) {
  let res = {};
  try {
    //
    // console.log("request.body: ", request.body);

    const schema = Joi.object({
      cost_value: Joi.number().min(MIN_DECIMAL).max(MAX_DECIMAL).required(),
      cost_type: Joi.string().valid("FIXED", "VARIABLE").required(),
      cost_paid: Joi.string().valid("TRUE", "FALSE").required(),
      cost_category: Joi.string().max(50).required(),
      cost_description: Joi.string().max(50).required(),
      cost_reference_month: Joi.string()
        .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
        .required(),
    });

    const result = schema.validate(request.body);
    if (result.error) {
      res.status = "error";
      res.message = result.error.details[0].message;
      return response.status(400).json(res);
    }

    const { cost_value, cost_type, cost_paid, cost_category, cost_description, cost_reference_month } = result.value;

    const insert_result = await InsertNewCost(app, cost_value, cost_type, cost_paid, cost_category, cost_description, cost_reference_month);

    if (!insert_result) {
      res.status = "error";
      res.message = "Erro ao criar custo.";
      return response.status(400).json(res);
    }

    res.status = "success";
    res.message = "Custo criado com sucesso.";
    return response.status(200).json(res);
  } catch (error) {
    console.log("[TRY-CATCH ERROR] controllers::ct_costs createCost error: ", error);
    res.status = "error";
    res.message = error.message;
    return response.status(400).json(res);
  }
};

//+----------------------------------------------------------------+
//| listCosts                                                      |
//+----------------------------------------------------------------+
module.exports.listCosts = async function (app, request, response) {
  let res = {};
  try {
    const schema = Joi.object({
      cost_reference_month: Joi.string()
        .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
        .required(),
    });

    const result = schema.validate(request.query);
    if (result.error) {
      res.status = "error";
      res.message = result.error.details[0].message;
      return response.status(400).json(res);
    }

    const { cost_reference_month } = result.value;

    const costs_result = await ListCostsByReferenceMonth(app, cost_reference_month);

    res.status = "success";
    res.costs = costs_result;
    return response.status(200).json(res);
  } catch (error) {
    console.log("[TRY-CATCH ERROR] controllers::ct_costs listCosts error: ", error);
    res.status = "error";
    res.message = error.message;
    return response.status(400).json(res);
  }
};

//+----------------------------------------------------------------+
//| deleteCost                                                     |
//+----------------------------------------------------------------+
module.exports.deleteCost = async function (app, request, response) {
  let res = {};
  try {
    const schema = Joi.object({
      cost_id: Joi.number().integer().min(1).max(MAX_UINT_32).required(),
    });

    const result = schema.validate(request.body);
    if (result.error) {
      res.status = "error";
      res.message = result.error.details[0].message;
      return response.status(400).json(res);
    }

    const { cost_id } = result.value;

    const cost_result = await GetCostById(app, cost_id);

    if (!cost_result) {
      res.status = "error";
      res.message = "Custo não encontrado.";
      return response.status(400).json(res);
    }

    if (cost_result.cost_status == "DELETED") {
      res.status = "error";
      res.message = "Custo já foi deletado.";
      return response.status(400).json(res);
    }

    const delete_result = await DeleteCostById(app, cost_id);

    if (!delete_result) {
      res.status = "error";
      res.message = "Ocorreu um erro ao deletar custo.";
      return response.status(400).json(res);
    }

    res.status = "success";
    res.message = "Custo deletado com sucesso.";
    return response.status(200).json(res);
  } catch (error) {
    console.log("[TRY-CATCH ERROR] controllers::ct_costs deleteCost error: ", error);
    res.status = "error";
    res.message = error.message;
    return response.status(400).json(res);
  }
};

//+----------------------------------------------------------------+
//| SQL QUERIES                                                    |
//+----------------------------------------------------------------+
function InsertNewCost(app, cost_value, cost_type, cost_paid, cost_category, cost_description, cost_reference_month) {
  return new Promise((resolve, reject) => {
    app.config.mysql((error, connection) => {
      if (!error) {
        const costs_dao = new app.models.mysql.costs_dao(connection);
        costs_dao.InsertNewCost(cost_value, cost_type, cost_paid, cost_category, cost_description, cost_reference_month, (error, result) => {
          connection.release();
          if (!error) {
            if (result.affectedRows > 0) {
              resolve(result);
            } else {
              resolve(null);
            }
          } else {
            reject(error);
          }
        });
      } else {
        reject(error);
      }
    });
  });
}

//
function ListCostsByReferenceMonth(app, cost_reference_month) {
  return new Promise((resolve, reject) => {
    app.config.mysql((error, connection) => {
      if (!error) {
        const costs_dao = new app.models.mysql.costs_dao(connection);
        costs_dao.ListCostsByReferenceMonth(cost_reference_month, (error, result) => {
          connection.release();
          if (!error) {
            if (result.length > 0) {
              resolve(result);
            } else {
              resolve([]);
            }
          } else {
            reject(error);
          }
        });
      } else {
        reject(error);
      }
    });
  });
}

//
function GetCostById(app, cost_id) {
  return new Promise((resolve, reject) => {
    app.config.mysql((error, connection) => {
      if (!error) {
        const costs_dao = new app.models.mysql.costs_dao(connection);
        costs_dao.GetCostById(cost_id, (error, result) => {
          connection.release();
          if (!error) {
            if (result.length > 0) {
              resolve(result[0]);
            } else {
              resolve(null);
            }
          } else {
            reject(error);
          }
        });
      } else {
        reject(error);
      }
    });
  });
}

//
function DeleteCostById(app, cost_id) {
  return new Promise((resolve, reject) => {
    app.config.mysql((error, connection) => {
      if (!error) {
        const costs_dao = new app.models.mysql.costs_dao(connection);
        costs_dao.DeleteCostById(cost_id, (error, result) => {
          connection.release();
          if (!error) {
            if (result.affectedRows > 0) {
              resolve(result);
            } else {
              resolve(null);
            }
          } else {
            reject(error);
          }
        });
      } else {
        reject(error);
      }
    });
  });
}
