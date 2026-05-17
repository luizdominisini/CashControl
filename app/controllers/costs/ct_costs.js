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

    const {
      cost_value,
      cost_type,
      cost_paid,
      cost_category,
      cost_description,
      cost_reference_month,
    } = result.value;

    const insert_result = await InsertNewCost(
      app,
      cost_value,
      cost_type,
      cost_paid,
      cost_category,
      cost_description,
      cost_reference_month,
    );

    if (!insert_result) {
      res.status = "error";
      res.message = "Erro ao criar custo.";
      return response.status(400).json(res);
    }

    res.status = "success";
    res.message = "Custo criado com sucesso.";
    return response.status(200).json(res);
  } catch (error) {
    console.log(
      "[TRY-CATCH ERROR] controllers::ct_costs createCost error: ",
      error,
    );
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

    console.log(cost_reference_month);

    res.status = "success";
    res.message = "Listagem de custos não implementada.";
    return response.status(200).json(res);
  } catch (error) {
    console.log(
      "[TRY-CATCH ERROR] controllers::ct_costs listCosts error: ",
      error,
    );
    res.status = "error";
    res.message = error.message;
    return response.status(400).json(res);
  }
};

//+----------------------------------------------------------------+
//| SQL QUERIES                                                    |
//+----------------------------------------------------------------+
function InsertNewCost(
  app,
  cost_value,
  cost_type,
  cost_paid,
  cost_category,
  cost_description,
  cost_reference_month,
) {
  return new Promise((resolve, reject) => {
    app.config.mysql((error, connection) => {
      if (!error) {
        const costs_dao = new app.models.mysql.costs_dao(connection);
        costs_dao.InsertNewCost(
          cost_value,
          cost_type,
          cost_paid,
          cost_category,
          cost_description,
          cost_reference_month,
          (error, result) => {
            if (!error) {
              if (result.affectedRows > 0) {
                resolve(result);
              } else {
                resolve(null);
              }
            } else {
              reject(error);
            }
          },
        );
      } else {
        reject(error);
      }
    });
  });
}
