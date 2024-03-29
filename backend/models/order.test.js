const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Seller = require("./seller.js");
const Product = require("./product.js");
const Order = require("./order.js");
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
  it("works", async () => {
    const sellerOneId = await Seller.getSellerId("Ribeyes & Co.");
    const productOneId = await Product.getProductId(
      "grass-fed ribeye",
      sellerOneId
    );

    const sellerTwoId = await Seller.getSellerId("Wings & Co.");
    const productTwoId = await Product.getProductId(
      "chicken wings",
      sellerTwoId
    );

    const products = [
      { productId: productOneId, quantity: 2 },
      { productId: productTwoId, quantity: 3 },
    ];
    const pricePaidInCents = 1000;

    const productOne = await Product.get(productOneId);
    const productTwo = await Product.get(productTwoId);

    const res = await db.query(
      "SELECT user_id FROM users WHERE username = 'user1'"
    );
    const userId = res.rows[0].user_id;
    const orderResult = await Order.create({
      userId,
      products,
      pricePaidInCents,
    });

    expect(orderResult).toEqual({
      userId,
      products: [
        {
          productId: productOne.productId,
          quantity: 2,
          priceInCents: productOne.priceInCents,
        },
        {
          productId: productTwo.productId,
          quantity: 3,
          priceInCents: productTwo.priceInCents,
        },
      ],
      pricePaidInCents,
      status: "processing",
      orderDate: orderResult.orderDate,
    });
  });
});

describe("findAll", () => {
  it("works", async () => {
    const orders = await Order.findAll();
    const userIds = getUserIdsArray();
    const productIds = getProductIdsArray();
    const orderIds = getOrderIdsArray();
    expect(orders).toEqual([
      {
        userId: userIds[0],
        products: [
          {
            productId: productIds[0],
            quantity: 10,
            priceInCents: 1000,
          },
          {
            productId: productIds[1],
            quantity: 10,
            priceInCents: 1000,
          },
        ],
        pricePaidInCents: 2000,
        status: "shipped",
        orderDate: new Date("2024-03-18T15:00:00.000Z"),
      },
      {
        userId: userIds[1],
        products: [
          {
            productId: productIds[0],
            quantity: 10,
            priceInCents: 1000,
          },
          {
            productId: productIds[1],
            quantity: 10,
            priceInCents: 1000,
          },
        ],
        pricePaidInCents: 2000,
        status: "delivered",
        orderDate: new Date("2024-03-18T16:00:00.000Z"),
      },
    ]);
  });
});

describe("get", () => {
  it("works", async () => {
    const userIds = getUserIdsArray();
    const productIds = getProductIdsArray();
    const orderIds = getOrderIdsArray();
    const order = await Order.get(orderIds[0]);
    expect(order).toEqual({
      userId: userIds[0],
      products: [
        {
          productId: productIds[0],
          quantity: 10,
          priceInCents: 1000,
        },
        {
          productId: productIds[1],
          quantity: 10,
          priceInCents: 1000,
        },
      ],
      pricePaidInCents: 2000,
      status: "shipped",
      orderDate: new Date("2024-03-18T15:00:00.000Z"),
    });
  });

  it("not found if no such order", async () => {
    try {
      const fakeOrder = await Order.get(93472);
      fail();
    } catch (e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("update", () => {
  it("works", async () => {
    const userIds = getUserIdsArray();
    const productIds = getProductIdsArray();
    const orderIds = getOrderIdsArray();
    const updateData = {
      userId: userIds[0],
      products: [
        {
          productId: productIds[0],
          quantity: 100,
          priceInCents: 10000,
        },
        {
          productId: productIds[1],
          quantity: 9,
          priceInCents: 19,
        },
      ],
      pricePaidInCents: 3000,
      status: "delivered",
      orderDate: new Date("2024-03-18T15:00:00.000Z"),
    };
    const updatedOrder = await Order.update(orderIds[0], updateData);
    expect(updatedOrder).toEqual(updateData);
  });

  it("not found if order no such order", async () => {
    try {
      const userIds = getUserIdsArray();
      const productIds = getProductIdsArray();
      const orderIds = getOrderIdsArray();
      const updateData = {
        userId: userIds[0],
        products: [
          {
            productId: productIds[0],
            quantity: 100,
            priceInCents: 10000,
          },
          {
            productId: productIds[1],
            quantity: 9,
            priceInCents: 19,
          },
        ],
        pricePaidInCents: 3000,
        status: "delivered",
        orderDate: new Date("2024-03-18T15:00:00.000Z"),
      };
      const updatedOrder = await Order.update(193348, updateData);
      fail();
    } catch (e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });

  it("bad request if no data", async () => {
    try {
      const orderIds = getOrderIdsArray();
      await Order.update(orderIds[0], {});
      fail("Expected BadRequestError to be thrown");
    } catch (e) {
      expect(e instanceof BadRequestError).toBeTruthy();
      expect(e.message).toBe("No data provided");
    }
  });
});

describe("remove", () => {
  test("works", async () => {
    const orderIds = getOrderIdsArray();
    await Order.remove(orderIds[0]);
    const responseOne = await db.query(
      `SELECT * FROM orders WHERE order_id = $1 AND deleted = FALSE`,
      [orderIds[0]]
    );
    const responseTwo = await db.query(
      `SELECT * FROM order_products WHERE order_id = $1 AND deleted = FALSE`,
      [orderIds[0]]
    );

    expect(responseOne.rows.length).toBe(0);
    expect(responseTwo.rows.length).toBe(0);
  });

  test("not found if no such order", async () => {
    try {
      await Order.remove(123871);
      fail();
    } catch (e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });
});
