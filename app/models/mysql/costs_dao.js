class DatabaseDAO {
  constructor(connection) {
    this._conn = connection;
  }

  //
  InsertNewCost(cost_value, cost_type, cost_paid, cost_category, cost_description, cost_reference_month, callback) {
    this._conn.query(
      "INSERT INTO tb_costs \
        (cost_value, cost_type, cost_status, cost_paid, cost_category, cost_description, cost_reference_month) \
      VALUES \
        (?, ?, 'ACTIVE', ?, ?, ?, ?);",
      [cost_value, cost_type, cost_paid, cost_category, cost_description, cost_reference_month],
      callback,
    );
  }

  //
  ListCostsByReferenceMonth(cost_reference_month, callback) {
    this._conn.query(
      "SELECT cost_id, cost_value, cost_type, cost_paid, cost_category, cost_description, cost_reference_month, cost_created_date \
       FROM tb_costs \
       WHERE cost_reference_month = ? \
       AND cost_status != 'DELETED';",
      [cost_reference_month],
      callback,
    );
  }

  //
  GetCostById(cost_id, callback) {
    this._conn.query(
      "SELECT cost_id, cost_value, cost_type, cost_status, cost_paid, cost_category, cost_description, cost_reference_month, cost_created_date \
       FROM tb_costs \
       WHERE cost_id = ?;",
      [cost_id],
      callback,
    );
  }

  //
  DeleteCostById(cost_id, callback) {
    this._conn.query(
      "UPDATE tb_costs \
       SET cost_status = 'DELETED' \
       WHERE cost_id = ?;",
      [cost_id],
      callback,
    );
  }
}

module.exports = function () {
  return DatabaseDAO;
};
