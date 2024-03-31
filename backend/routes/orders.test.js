const request = require("supertest");

const db = require("../db.js");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  getSellerOneId,
  getProductOneId,
  getUserOneId,
  getProductOnePriceInCents,
} = require("./_testCommon");
const { NotFoundError } = require("../expressError.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /orders/create */

describe("POST /orders/create", () => {
  test("works", async () => {
    const newOrder = {
      userId: getUserOneId().toString(),
      products: [
        {
          productId: getProductOneId().toString(),
          quantity: 2,
          priceInCents: getProductOnePriceInCents(),
        },
      ],
      pricePaidInCents: 2 * getProductOnePriceInCents(),
    };

    const response = await request(app).post(`/orders/create`).send(newOrder);

    expect(response.body.order).toEqual({
      userId: getUserOneId(),
      products: [
        {
          productId: getProductOneId(),
          quantity: 2,
          priceInCents: getProductOnePriceInCents(),
        },
      ],
      pricePaidInCents: 2 * getProductOnePriceInCents(),
      status: "processing",
      orderDate: expect.any(String),
    });
  });

  test("bad request with missing data", async () => {
    const response = await request(app).post(`/orders/create`).send({
      userId: getUserOneId().toString(),
    });

    expect(response.statusCode).toEqual(400);
  });
});

/************************************** GET /orders */

describe("GET /orders", () => {
  test("works", async () => {
    let orders = [
      {
        userId: getUserOneId(),
        products: [
          {
            productId: expect.any(Number),
            quantity: 2,
            priceInCents: expect.any(Number),
          },
        ],
        pricePaidInCents: expect.any(Number),
        status: expect.any(String),
        orderDate: expect.any(String),
      },
      {
        userId: expect.any(Number),
        products: [
          {
            productId: expect.any(Number),
            quantity: 1,
            priceInCents: expect.any(Number),
          },
          {
            productId: expect.any(Number),
            quantity: 2,
            priceInCents: expect.any(Number),
          },
        ],
        pricePaidInCents: expect.any(Number),
        status: expect.any(String),
        orderDate: expect.any(String),
      },
    ];
    const response = await request(app).get(`/orders`);
    expect(response.body.orders).toEqual(orders);
  });
});

/************************************** GET /orders/:orderId */

describe("GET /orders/:orderId", () => {
  test("works", async () => {
    const res = await db.query(
      'SELECT order_id AS "orderId" FROM orders WHERE user_id = $1',
      [getUserOneId()]
    );

    const response = await request(app).get(`/orders/${res.rows[0].orderId}`);
    expect(response.body.order).toEqual({
      userId: getUserOneId(),
      products: [
        {
          productId: expect.any(Number),
          quantity: 2,
          priceInCents: expect.any(Number),
        },
      ],
      pricePaidInCents: expect.any(Number),
      status: expect.any(String),
      orderDate: expect.any(String),
    });
  });

  test("not found if no such order", async () => {
    const response = await request(app).get(`/orders/13121`);
    expect(response.statusCode).toEqual(404);
  });
});

/************************************** PATCH /orders/:orderId */

describe("PATCH /orders/:orderId", () => {
  test("works", async () => {
    const res = await db.query(
      'SELECT order_id AS "orderId" FROM orders WHERE user_id = $1',
      [getUserOneId()]
    );

    const updateData = {
      products: [
        {
          productId: getProductOneId().toString(),
          quantity: 2,
          priceInCents: 2000,
        },
      ],
      pricePaidInCents: 2 * 11000,
      status: "delivered",
    };
    const response = await request(app)
      .patch(`/orders/${res.rows[0].orderId}`)
      .send(updateData);

    console.log(response.body);
    expect(response.body.order).toEqual({
      userId: getUserOneId(),
      products: [
        {
          productId: expect.any(Number),
          quantity: 2,
          priceInCents: 2000,
        },
      ],
      pricePaidInCents: 2 * 11000,
      status: "delivered",
      orderDate: expect.any(String),
    });
  });

  test("not found if no such order", async () => {
    const updateData = {
      products: [
        {
          productId: getProductOneId().toString(),
          quantity: 2,
          priceInCents: 2000,
        },
      ],
      pricePaidInCents: 2 * 11000,
      status: "delivered",
    };
    const response = await request(app)
      .patch(`/orders/218312`)
      .send(updateData);
    expect(response.statusCode).toEqual(404);
  });

  test("bad request if invalid data", async () => {
    const res = await db.query(
      'SELECT order_id AS "orderId" FROM orders WHERE user_id = $1',
      [getUserOneId()]
    );
    const response = await request(app)
      .patch(`/orders/${res.rows[0].orderId}`)
      .send({});
    expect(response.statusCode).toEqual(400);
  });
});

/************************************** PATCH /orders/:orderId/remove */

describe("PATCH /orders/:orderId/remove", () => {
  test("works", async () => {
    const res = await db.query(
      'SELECT order_id AS "orderId" FROM orders WHERE user_id = $1',
      [getUserOneId()]
    );
    const response = await request(app).patch(
      `/orders/${res.rows[0].orderId}/remove`
    );
    expect(response.body).toEqual({
      orderId: expect.any(String),
      deleted: true,
    });
  });

  test("not found if no such order", async () => {
    const response = await request(app).patch(`/orders/319381/remove`);

    expect(response.statusCode).toEqual(404);
  });
});
