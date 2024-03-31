const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Seller = require("./seller.js");
const Product = require("./product.js");
const Order = require("./order.js");
const OrderProduct = require("./orderProduct.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  getUserIdsArray,
  getProductIdsArray,
  getOrderIdsArray,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", () => {
  test("create new order-product relationship", async () => {
    const orderId = getOrderIdsArray()[0];
    const productId = getProductIdsArray()[0];

    const quantity = 10;
    const pricePaidInCents = 1000;

    await OrderProduct.create(orderId, productId, quantity, pricePaidInCents);

    const result = await db.query(
      `SELECT * FROM order_products WHERE order_id = $1 AND product_id = $2`,
      [orderId, productId]
    );
    console.log(result.rows);
    expect(result.rows.length).toBe(2);
    expect(result.rows[0].order_id).toBe(orderId);
    expect(result.rows[0].product_id).toBe(productId);
    expect(result.rows[0].quantity).toBe(quantity);
    expect(result.rows[0].price_in_cents).toBe(pricePaidInCents);
  });
});
