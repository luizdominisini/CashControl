class DatabaseDAO {
  constructor(connection) {
    this._conn = connection;
  }

  //
  InsertNewProduct(category_id, product_name, product_price, product_purchase_price, product_quantity, product_min_quantity, product_supplier, callback) {
    this._conn.query(
      "INSERT INTO tb_products \
        (category_id, product_name, product_price, product_purchase_price, product_quantity, product_min_quantity, product_supplier) \
      VALUES \
        (?, ?, ?, ?, ?, ?, ?);",
      [category_id, product_name, product_price, product_purchase_price, product_quantity, product_min_quantity, product_supplier ?? null],
      callback,
    );
  }
  //
  UpdateProductById(product_id, category_id, product_name, product_price, product_purchase_price, product_quantity, product_min_quantity, product_supplier, callback) {
    this._conn.query(
      "UPDATE tb_products \
       SET category_id = ?, product_name = ?, product_price = ?, product_purchase_price = ?, \
           product_quantity = ?, product_min_quantity = ?, product_supplier = ? \
       WHERE product_id = ? AND product_status != 'DELETED';",
      [category_id, product_name, product_price, product_purchase_price, product_quantity, product_min_quantity, product_supplier ?? null, product_id],
      callback,
    );
  }

  //
  GetProductById(product_id, callback) {
    this._conn.query(
      "SELECT product_id, category_id, product_name, product_price, product_purchase_price, \
              product_quantity, product_min_quantity, product_supplier, product_status \
       FROM tb_products \
       WHERE product_id = ?;",
      [product_id],
      callback,
    );
  }

  //
  DeleteProductById(product_id, callback) {
    this._conn.query(
      "UPDATE tb_products \
       SET product_status = 'DELETED' \
       WHERE product_id = ?;",
      [product_id],
      callback,
    );
  }

  //
  ListProducts(callback) {
    this._conn.query(
      "SELECT product_id, category_id, product_name, product_price, product_purchase_price, \
              product_quantity, product_min_quantity, product_supplier, created_date \
       FROM tb_products \
       WHERE product_status != 'DELETED' \
       ORDER BY product_name ASC;",
      callback,
    );
  }

  //
  ListProductsByCategoryId(category_id, callback) {
    this._conn.query(
      "SELECT product_id, category_id, product_name, product_price, product_purchase_price, \
              product_quantity, product_min_quantity, product_supplier, created_date \
       FROM tb_products \
       WHERE category_id = ? \
       AND product_status != 'DELETED' \
       ORDER BY product_name ASC;",
      [category_id],
      callback,
    );
  }
}

module.exports = function () {
  return DatabaseDAO;
};
