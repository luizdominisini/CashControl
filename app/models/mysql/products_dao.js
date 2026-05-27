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
}

module.exports = function () {
  return DatabaseDAO;
};
