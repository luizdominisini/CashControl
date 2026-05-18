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

  //
  UpdateCostById(cost_id, cost_value, cost_type, cost_paid, cost_category, cost_description, callback) {
    this._conn.query(
      "UPDATE tb_costs \
       SET cost_value = ?, cost_type = ?, cost_paid = ?, cost_category = ?, cost_description = ? \
       WHERE cost_id = ? AND cost_status != 'DELETED';",
      [cost_value, cost_type, cost_paid, cost_category, cost_description, cost_id],
      callback,
    );
  }

  //
  ListCostsByReferenceMonthAndType(cost_reference_month, cost_type, callback) {
    this._conn.query(
      "SELECT cost_id, cost_value, cost_type, cost_paid, cost_category, cost_description, cost_reference_month, cost_created_date \
       FROM tb_costs \
       WHERE cost_reference_month = ? \
       AND cost_type = ? \
       AND cost_status != 'DELETED';",
      [cost_reference_month, cost_type],
      callback,
    );
  }

  //
  GetSummaryByReferenceMonth(cost_reference_month, callback) {
    this._conn.query(
      "SELECT \
         COUNT(*) AS count, \
         COALESCE(SUM(cost_value), 0) AS total, \
         COALESCE(SUM(CASE WHEN cost_paid = 'TRUE'  THEN cost_value ELSE 0 END), 0) AS paid, \
         COALESCE(SUM(CASE WHEN cost_paid = 'FALSE' THEN cost_value ELSE 0 END), 0) AS unpaid \
       FROM tb_costs \
       WHERE cost_reference_month = ? \
       AND cost_status != 'DELETED';",
      [cost_reference_month],
      callback,
    );
  }
}

module.exports = function () {
  return DatabaseDAO;
};
