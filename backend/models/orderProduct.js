const db = require("../db"); // Import your database module
const Order = require("./order");
const Product = require("./product");
const { createSqlSetClause } = require("../helpers/sql");
const { NotFoundError, BadRequestError } = require("../expressError");

class OrderProduct {
  /** Create a new order-product relationship
   */
  static async create(orderId, productId, quantity, pricePaidInCents) {
    const result = await db.query(
      `INSERT INTO order_products (order_id, product_id, quantity, price_in_cents)
       VALUES ($1, $2, $3, $4)`,
      [orderId, productId, quantity, pricePaidInCents]
    );
  }

  /** Given an orderId, return orderProduct
   *
   * Returns { orderId, productId, quantity, priceInCents }
   *
   * Throws NotFoundError if no such order or set as deleted
   */
  static async findByOrderId(orderId) {
    const order = Order.get(orderId);

    const result = await db.query(
      `SELECT order_id AS "orderId",
              product_id AS "productId" ,
              quantity
              price_in_cents AS "priceInCents"
       FROM order_products 
       WHERE order_id = $1 AND deleted = FALSE`,
      [orderId]
    );
    return result.rows;
  }

  /** Given orderId, productId, and newQuantity.
   *
   * Update OrderProduct relationship
   *
   * Throws NotFoundError if order or product are not found or set as deleted
   */
  static async update(productId, data) {
    const { setCols, values } = createSqlSetClause(data, {
      quantity: "quantity",
      priceInCents: "price_in_cents",
    });

    const orderIdVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE order_products
                      SET ${setCols}
                      WHERE product_id = ${orderIdVarIdx}
                      RETURNING order_id AS "orderId",
                                product_id AS "productId",
                                quantity,
                                price_in_cents AS "priceInCents"`;

    const result = await db.query(querySql, [...values, productId]);
    const orderProduct = result.rows[0];

    if (!orderProduct) {
      throw new NotFoundError(
        `No order product found with product ID: ${productId}`
      );
    }

    return orderProduct;
  }

  /** Remove OrderProduct relationship
   *
   * Set deleted as TRUE
   *
   * Throws NotFoundError if no such order or product  or set as deleted
   */
  static async remove(orderId, productId) {
    const order = Order.get(orderId);
    const product = Product.get(productId);

    await db.query(
      `UPDATE order_products
       SET deleted = TRUE
       WHERE order_id = $1 AND product_id = $2 AND deleted = FALSE`,
      [orderId, productId]
    );
  }
}

module.exports = OrderProduct;
