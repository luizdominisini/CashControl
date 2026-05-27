const Joi = require("joi");
const MAX_UINT_32 = 4294967295;
const MAX_DECIMAL = 99999999.99;

//+----------------------------------------------------------------+
//| createProduct                                                  |
//+----------------------------------------------------------------+
module.exports.createProduct = async function (app, request, response) {
  let res = {};
  try {
    // console.log("request.body: ", request.body);

    const schema = Joi.object({
      category_id: Joi.number().integer().min(1).max(MAX_UINT_32).required(),
      product_name: Joi.string().max(64).required(),
      product_price: Joi.number().min(0).max(MAX_DECIMAL).required(),
      product_purchase_price: Joi.number().min(0).max(MAX_DECIMAL).required(),
      product_quantity: Joi.number().integer().min(0).max(MAX_UINT_32).required(),
      product_min_quantity: Joi.number().integer().min(0).max(MAX_UINT_32).required(),
      product_supplier: Joi.string().max(64).optional(),
    });

    const result = schema.validate(request.body);
    if (result.error) {
      res.status = "error";
      res.message = result.error.details[0].message;
      return response.status(400).json(res);
    }

    const { category_id, product_name, product_price, product_purchase_price, product_quantity, product_min_quantity, product_supplier } = result.value;

    const category_result = await GetCategoryById(app, category_id);
    if (!category_result) {
      res.status = "error";
      res.message = "Categoria não encontrada.";
      return response.status(400).json(res);
    }

    if (category_result.category_status === "DELETED") {
      res.status = "error";
      res.message = "Categoria inativa.";
      return response.status(400).json(res);
    }

    const insert_result = await InsertNewProduct(app, category_id, product_name, product_price, product_purchase_price, product_quantity, product_min_quantity, product_supplier);

    if (!insert_result) {
      res.status = "error";
      res.message = "Erro ao criar produto.";
      return response.status(400).json(res);
    }

    res.status = "success";
    res.message = "Produto criado com sucesso.";
    return response.status(200).json(res);
  } catch (error) {
    console.log("[TRY-CATCH ERROR] controllers::ct_products createProduct error: ", error);
    res.status = "error";
    res.message = error.message;
    return response.status(400).json(res);
  }
};

//+----------------------------------------------------------------+
//| listProducts                                                   |
//+----------------------------------------------------------------+
module.exports.listProducts = async function (app, request, response) {};

//+----------------------------------------------------------------+
//| deleteProduct                                                  |
//+----------------------------------------------------------------+
module.exports.deleteProduct = async function (app, request, response) {};

//+----------------------------------------------------------------+
//| updateProduct                                                  |
//+----------------------------------------------------------------+
module.exports.updateProduct = async function (app, request, response) {};

//+----------------------------------------------------------------+
//| SQL QUERIES                                                    |
//+----------------------------------------------------------------+
function GetCategoryById(app, category_id) {
  return new Promise((resolve, reject) => {
    app.config.mysql((error, connection) => {
      if (!error) {
        const categories_dao = new app.models.mysql.categories_dao(connection);
        categories_dao.GetCategoryById(category_id, (error, result) => {
          connection.release();
          if (!error) {
            resolve(result.length > 0 ? result[0] : null);
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
function InsertNewProduct(app, category_id, product_name, product_price, product_purchase_price, product_quantity, product_min_quantity, product_supplier) {
  return new Promise((resolve, reject) => {
    app.config.mysql((error, connection) => {
      if (!error) {
        const products_dao = new app.models.mysql.products_dao(connection);
        products_dao.InsertNewProduct(category_id, product_name, product_price, product_purchase_price, product_quantity, product_min_quantity, product_supplier, (error, result) => {
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
