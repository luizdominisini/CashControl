const Joi = require("joi");
const MAX_UINT_32 = 4294967295;

//+----------------------------------------------------------------+
//| createCategory                                                 |
//+----------------------------------------------------------------+
module.exports.createCategory = async function (app, request, response) {
  let res = {};
  try {
    const schema = Joi.object({
      category_name: Joi.string().max(64).required(),
    });

    const result = schema.validate(request.body);
    if (result.error) {
      res.status = "error";
      res.message = result.error.details[0].message;
      return response.status(400).json(res);
    }

    const { category_name } = result.value;

    const insert_result = await InsertNewCategory(app, category_name);

    if (!insert_result) {
      res.status = "error";
      res.message = "Erro ao criar categoria.";
      return response.status(400).json(res);
    }

    res.status = "success";
    res.message = "Categoria criada com sucesso.";
    return response.status(200).json(res);
  } catch (error) {
    console.log("[TRY-CATCH ERROR] controllers::ct_categories createCategory error: ", error);
    res.status = "error";
    res.message = error.message;
    return response.status(400).json(res);
  }
};

//+----------------------------------------------------------------+
//| listCategories                                                 |
//+----------------------------------------------------------------+
module.exports.listCategories = async function (app, _request, response) {
  let res = {};
  try {
    const categories_result = await ListCategories(app);

    res.status = "success";
    res.categories = categories_result;
    return response.status(200).json(res);
  } catch (error) {
    console.log("[TRY-CATCH ERROR] controllers::ct_categories listCategories error: ", error);
    res.status = "error";
    res.message = error.message;
    return response.status(400).json(res);
  }
};

//+----------------------------------------------------------------+
//| deleteCategory                                                 |
//+----------------------------------------------------------------+
module.exports.deleteCategory = async function (app, request, response) {
  let res = {};
  try {
    const schema = Joi.object({
      category_id: Joi.number().integer().min(1).max(MAX_UINT_32).required(),
    });

    const result = schema.validate(request.body);
    if (result.error) {
      res.status = "error";
      res.message = result.error.details[0].message;
      return response.status(400).json(res);
    }

    const { category_id } = result.value;

    const category_result = await GetCategoryById(app, category_id);

    if (!category_result) {
      res.status = "error";
      res.message = "Categoria não encontrada.";
      return response.status(400).json(res);
    }

    if (category_result.category_status === "DELETED") {
      res.status = "error";
      res.message = "Categoria já foi deletada.";
      return response.status(400).json(res);
    }

    const delete_result = await DeleteCategoryById(app, category_id);

    if (!delete_result) {
      res.status = "error";
      res.message = "Ocorreu um erro ao deletar categoria.";
      return response.status(400).json(res);
    }

    res.status = "success";
    res.message = "Categoria deletada com sucesso.";
    return response.status(200).json(res);
  } catch (error) {
    console.log("[TRY-CATCH ERROR] controllers::ct_categories deleteCategory error: ", error);
    res.status = "error";
    res.message = error.message;
    return response.status(400).json(res);
  }
};

//+----------------------------------------------------------------+
//| updateCategory                                                 |
//+----------------------------------------------------------------+
module.exports.updateCategory = async function (app, request, response) {
  let res = {};
  try {
    const schema = Joi.object({
      category_id: Joi.number().integer().min(1).max(MAX_UINT_32).required(),
      category_name: Joi.string().max(64).required(),
    });

    const result = schema.validate(request.body);
    if (result.error) {
      res.status = "error";
      res.message = result.error.details[0].message;
      return response.status(400).json(res);
    }

    const { category_id, category_name } = result.value;

    const category_result = await GetCategoryById(app, category_id);

    if (!category_result) {
      res.status = "error";
      res.message = "Categoria não encontrada.";
      return response.status(400).json(res);
    }

    if (category_result.category_status === "DELETED") {
      res.status = "error";
      res.message = "Categoria já foi deletada.";
      return response.status(400).json(res);
    }

    const update_result = await UpdateCategoryById(app, category_id, category_name);

    if (!update_result) {
      res.status = "error";
      res.message = "Erro ao atualizar categoria.";
      return response.status(400).json(res);
    }

    res.status = "success";
    res.message = "Categoria atualizada com sucesso.";
    return response.status(200).json(res);
  } catch (error) {
    console.log("[TRY-CATCH ERROR] controllers::ct_categories updateCategory error: ", error);
    res.status = "error";
    res.message = error.message;
    return response.status(400).json(res);
  }
};

//+----------------------------------------------------------------+
//| SQL QUERIES                                                    |
//+----------------------------------------------------------------+
function UpdateCategoryById(app, category_id, category_name) {
  return new Promise((resolve, reject) => {
    app.config.mysql((error, connection) => {
      if (!error) {
        const categories_dao = new app.models.mysql.categories_dao(connection);
        categories_dao.UpdateCategoryById(category_id, category_name, (error, result) => {
          connection.release();
          if (!error) {
            resolve(result.affectedRows > 0 ? result : null);
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
function DeleteCategoryById(app, category_id) {
  return new Promise((resolve, reject) => {
    app.config.mysql((error, connection) => {
      if (!error) {
        const categories_dao = new app.models.mysql.categories_dao(connection);
        categories_dao.DeleteCategoryById(category_id, (error, result) => {
          connection.release();
          if (!error) {
            resolve(result.affectedRows > 0 ? result : null);
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
function ListCategories(app) {
  return new Promise((resolve, reject) => {
    app.config.mysql((error, connection) => {
      if (!error) {
        const categories_dao = new app.models.mysql.categories_dao(connection);
        categories_dao.ListCategories((error, result) => {
          connection.release();
          if (!error) {
            resolve(result.length > 0 ? result : []);
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
function InsertNewCategory(app, category_name) {
  return new Promise((resolve, reject) => {
    app.config.mysql((error, connection) => {
      if (!error) {
        const categories_dao = new app.models.mysql.categories_dao(connection);
        categories_dao.InsertNewCategory(category_name, (error, result) => {
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
