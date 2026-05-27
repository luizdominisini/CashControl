class DatabaseDAO {
  constructor(connection) {
    this._conn = connection;
  }

  //
  InsertNewCategory(category_name, callback) {
    this._conn.query(
      "INSERT INTO tb_categories \
        (category_name) \
      VALUES \
        (?);",
      [category_name],
      callback,
    );
  }
  //
  UpdateCategoryById(category_id, category_name, callback) {
    this._conn.query(
      "UPDATE tb_categories \
       SET category_name = ? \
       WHERE category_id = ? AND category_status != 'DELETED';",
      [category_name, category_id],
      callback,
    );
  }

  //
  GetCategoryById(category_id, callback) {
    this._conn.query(
      "SELECT category_id, category_name, category_status, created_date \
       FROM tb_categories \
       WHERE category_id = ?;",
      [category_id],
      callback,
    );
  }

  //
  DeleteCategoryById(category_id, callback) {
    this._conn.query(
      "UPDATE tb_categories \
       SET category_status = 'DELETED' \
       WHERE category_id = ?;",
      [category_id],
      callback,
    );
  }

  //
  ListCategories(callback) {
    this._conn.query(
      "SELECT category_id, category_name, created_date \
       FROM tb_categories \
       WHERE category_status != 'DELETED';",
      callback,
    );
  }
}

module.exports = function () {
  return DatabaseDAO;
};
