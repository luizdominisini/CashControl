class DatabaseDAO {
  constructor(connection) {
    this._conn = connection;
  }

  InsertNewCost(
    cost_value,
    cost_type,
    cost_paid,
    cost_category,
    cost_description,
    cost_reference_month,
    callback,
  ) {
    this._conn.query(
      "INSERT INTO tb_costs \
        (cost_value, cost_type, cost_status, cost_paid, cost_category, cost_description, cost_reference_month) \
      VALUES \
        (?, ?, 'ACTIVE', ?, ?, ?, ?);",
      [
        cost_value,
        cost_type,
        cost_paid,
        cost_category,
        cost_description,
        cost_reference_month,
      ],
      callback,
    );
  }
}

module.exports = function () {
  return DatabaseDAO;
};
