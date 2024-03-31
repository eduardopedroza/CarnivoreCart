const db = require("../db");
const { createSqlSetClause } = require("../helpers/sql");
const { NotFoundError, BadRequestError } = require("../expressError");
const Product = require("./product");
const User = require("./user");
const OrderProduct = require("./orderProduct");

class Order {
  /** Create order with order data
   *
   * data should be { userId, products, pricePaidInCents }
   *    where products is [ { productId, quantiy, priceInCents } ]
   *
   * Returns { userId, products, pricePaidInCents, status, orderDate }
   *      where products is [ { productId, quantiy, priceInCents } ]
   *
   * Throws NotFoundError if no such user or products
   */
  static async create({ userId, products, pricePaidInCents }) {
    const user = await User.getUserWithId(userId);

    const verifiedProducts = [];

    for (const product of products) {
      const { productId, quantity } = product;
      const verifiedProduct = await Product.get(productId);
      verifiedProducts.push({ verifiedProduct, quantity });
    }

    const orderResult = await db.query(
      `INSERT INTO orders(user_id, price_paid_in_cents, status)
       VALUES ($1, $2, $3)
       RETURNING order_id AS "orderId",
                 user_id AS "userId",
                 price_paid_in_cents AS "pricePaidInCents",
                 status,
                 order_date AS "orderDate"`,
      [userId, pricePaidInCents, "processing"]
    );

    const order = orderResult.rows[0];

    for (const { verifiedProduct, quantity } of verifiedProducts) {
      await OrderProduct.create(
        order.orderId,
        verifiedProduct.productId,
        quantity,
        verifiedProduct.priceInCents
      );
    }

    return {
      userId: order.userId,
      products: verifiedProducts.map(({ verifiedProduct, quantity }) => ({
        productId: verifiedProduct.productId,
        quantity: quantity,
        priceInCents: verifiedProduct.priceInCents,
      })),
      pricePaidInCents: order.pricePaidInCents,
      status: order.status,
      orderDate: order.orderDate,
    };
  }

  /** Find all orders
   *
   * Returns [{ userId, products pricePaidInCents, status, orderDate }]
   *      where products is [ { productId, quantiy, priceInCents } ]
   */
  static async findAll() {
    const ordersQuery = await db.query(
      `SELECT o.order_id,
              o.user_id AS "userId",
              o.price_paid_in_cents AS "pricePaidInCents",
              o.status,
              o.order_date AS "orderDate",
              op.product_id AS "productId",
              op.quantity,
              op.price_in_cents AS "priceInCents"
       FROM orders o
       JOIN order_products op ON o.order_id = op.order_id
       WHERE o.deleted = FALSE AND op.deleted = FALSE`
    );
    const ordersMap = new Map();

    ordersQuery.rows.forEach((row) => {
      const orderId = row.order_id;

      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          userId: row.userId,
          pricePaidInCents: row.pricePaidInCents,
          status: row.status,
          orderDate: row.orderDate,
          products: [],
        });
      }

      ordersMap.get(orderId).products.push({
        productId: row.productId,
        quantity: row.quantity,
        priceInCents: row.priceInCents,
      });
    });

    const orders = Array.from(ordersMap.values());

    return orders;
  }

  /** Given orderId, return order data
   *
   * Returns { userId, products, pricePaidInCents, status, orderDate }
   *    where products is [ { productId, quantiy, priceInCents } ]
   *
   * Throws NotFoundError if no such user or set as deleted
   */

  static async get(orderId) {
    const result = await db.query(
      `SELECT o.order_id,
              o.user_id AS "userId",
              o.price_paid_in_cents AS "pricePaidInCents",
              o.status,
              o.order_date AS "orderDate",
              op.product_id AS "productId",
              op.quantity,
              op.price_in_cents AS "priceInCents"
       FROM orders o
       JOIN order_products op ON o.order_id = op.order_id
       WHERE o.order_id = $1 AND o.deleted = FALSE AND op.deleted = FALSE`,
      [orderId]
    );
    const orderRows = result.rows;

    if (orderRows.length === 0)
      throw new NotFoundError(`No such order with ID: ${orderId}`);

    const products = orderRows.map((row) => ({
      productId: row.productId,
      quantity: row.quantity,
      priceInCents: row.priceInCents,
    }));

    const { userId, pricePaidInCents, status, orderDate } = orderRows[0];

    const order = {
      userId,
      pricePaidInCents,
      status,
      orderDate,
      products,
    };

    return order;
  }

  /** Update order, with 'data'
   *
   * data can include { products, pricePaidInCents, status }
   *    where products is [ { productId, quantiy, priceInCents } ]
   *
   * Returns updatedOrder { userId, products pricePaidInCents, status, orderDate }
   *    where products is [ { productId, quantiy, priceInCents } ]
   *
   * Throws NotFoundError if no such order or set as deleted
   */
  static async update(orderId, data) {
    const { products, ...dataWithoutProducts } = data;
    const { setCols, values } = createSqlSetClause(dataWithoutProducts, {
      pricePaidInCents: "price_paid_in_cents",
      userId: "user_id",
      orderDate: "order_date",
    });

    const sellerVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE orders
                      SET ${setCols}
                      WHERE order_id = ${sellerVarIdx} AND deleted = FALSE
                      RETURNING user_id,
                                price_paid_in_cents AS "pricePaidInCents",
                                status,
                                order_date AS "orderDate"`;

    let result = await db.query(querySql, [...values, orderId]);
    let order = result.rows[0];

    if (!order) throw new NotFoundError(`No order with ID: ${orderId}`);

    // If there are products to update
    if (products) {
      for (const product of products) {
        await OrderProduct.update(product.productId, {
          quantity: product.quantity,
          priceInCents: product.priceInCents,
        });
      }
    }

    const updatedOrder = await this.get(orderId);

    return updatedOrder;
  }

  /** Given orderId, set Order and OrderProduct as deleted
   *
   * Checks if Order exists
   *
   * Throws NotFoundError if no such order or set to deleted
   *
   * Sets Orders and OrderProducts as deleted
   */

  static async remove(orderId) {
    const order = await this.get(orderId);

    await db.query(
      `UPDATE orders
       SET deleted = TRUE
       WHERE order_id = $1`,
      [orderId]
    );

    await db.query(
      `UPDATE order_products
       SET deleted = TRUE
       WHERE order_id = $1 AND deleted = FALSE`,
      [orderId]
    );
  }
}

module.exports = Order;
