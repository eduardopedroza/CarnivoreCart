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
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /products/create */

describe("POST /products/create", () => {
  test("works", async () => {
    const newProduct = {
      sellerId: getSellerOneId().toString(),
      name: "Testing TP1",
      description: "Testing This is a test description",
      priceInCents: 2000,
      meatType: "testing test beef type 1",
      cutType: "testing test cut type 1",
      weightInGrams: 500,
      imageUrl: "www.fakepic1.com",
    };
    const response = await request(app)
      .post(`/products/create`)
      .send(newProduct);

    delete newProduct.productId;

    expect(response.body.product).toEqual({
      ...newProduct,
      sellerId: getSellerOneId(),
      productId: expect.any(Number),
    });
  });

  test("bad request with missing fields", async () => {
    const response = await request(app).post(`/products/create`).send({
      description: "Testing This is a test description",
      priceInCents: 2000,
      meatType: "testing test beef type 1",
      cutType: "testing test cut type 1",
    });
    expect(response.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async () => {
    const response = await request(app).post(`/products/create`).send({
      sellerId: getSellerOneId(),
      name: "Testing TP1",
      description: "Testing This is a test description",
      priceInCents: "123412",
      meatType: "testing test beef type 1",
      cutType: "testing test cut type 1",
      weightInGrams: "0.342",
      imageUrl: "www.fakepic1.com",
    });
    expect(response.statusCode).toEqual(400);
  });
});

/************************************** GET /products */

describe("GET /products", () => {
  test("works", async () => {
    const response = await request(app).get("/products");
    expect(response.body.products).toEqual([
      {
        sellerId: expect.any(Number),
        name: "TP1",
        description: "This is a test description",
        priceInCents: 1000,
        meatType: "test beef type 1",
        cutType: "test cut type 1",
        weightInGrams: 300,
        imageUrl: "www.fakepic.com",
      },
      {
        sellerId: expect.any(Number),
        name: "TP2",
        description: "This is a test description",
        priceInCents: 2000,
        meatType: "test beef type 2",
        cutType: "test cut type 2",
        weightInGrams: 300,
        imageUrl: "www.fakepic.com",
      },
      {
        sellerId: expect.any(Number),
        name: "TP2",
        description: "This is a test description",
        priceInCents: 2000,
        meatType: "test beef type 3",
        cutType: "test cut type 3",
        weightInGrams: 300,
        imageUrl: "www.fakepic.com",
      },
    ]);
  });
});

/************************************** GET /products/:productId */

describe("GET /products/:productId", () => {
  test("works", async () => {
    let res = await db.query(
      `SELECT product_id AS "productId" FROM products WHERE name = 'TP1'`
    );

    const response = await request(app).get(
      `/products/${res.rows[0].productId}`
    );
    expect(response.body).toEqual({
      product: {
        productId: expect.any(Number),
        sellerId: expect.any(Number),
        name: "TP1",
        description: "This is a test description",
        priceInCents: 1000,
        meatType: "test beef type 1",
        cutType: "test cut type 1",
        weightInGrams: 300,
        imageUrl: "www.fakepic.com",
      },
      reviews: [
        {
          productId: expect.any(Number),
          reviewId: expect.any(Number),
          userId: expect.any(Number),
          rating: "4.5",
          comment: "awesome cut",
          reviewDate: expect.any(String),
        },
      ],
    });
  });

  test("not found if no such product", async () => {
    const response = await request(app).get(`/products/213112`);
    expect(response.statusCode).toEqual(404);
  });
});

/************************************** GET /products/:productId/reviews/:reviewId */

describe("GET /products/:productId/reviews/:reviewId", () => {
  test("works", async () => {
    let res1 = await db.query(
      `SELECT product_id AS "productId" FROM products WHERE name = 'TP1'`
    );

    let res2 = await db.query(
      `SELECT review_id AS "reviewId" FROM reviews WHERE product_id = $1`,
      [res1.rows[0].productId]
    );

    const response = await request(app).get(
      `/products/${res1.rows[0].productId}/reviews/${res2.rows[0].reviewId}`
    );

    expect(response.body).toEqual({
      product: {
        productId: expect.any(Number),
        sellerId: expect.any(Number),
        name: "TP1",
        description: "This is a test description",
        priceInCents: 1000,
        meatType: "test beef type 1",
        cutType: "test cut type 1",
        weightInGrams: 300,
        imageUrl: "www.fakepic.com",
      },
      review: {
        productId: expect.any(Number),
        reviewId: res2.rows[0].reviewId,
        userId: expect.any(Number),
        rating: "4.5",
        comment: "awesome cut",
        reviewDate: expect.any(String),
      },
    });
  });

  test("not found if no such product", async () => {
    const response = await request(app).get(`/products/213112`);
    expect(response.statusCode).toEqual(404);
  });
});

/************************************** PATCH /products/:productId */

describe("PATCH /products/:productId", () => {
  test("works", async () => {
    let res = await db.query(
      `SELECT product_id AS "productId" FROM products WHERE name = 'TP1'`
    );
    const response = await request(app)
      .patch(`/products/${res.rows[0].productId}`)
      .send({
        description: "Updated This is a test description",
        priceInCents: 2000,
        weightInGrams: 500,
        imageUrl: "www.updatedfakepic.com",
      });

    expect(response.body.product).toEqual({
      description: "Updated This is a test description",
      priceInCents: 2000,
      weightInGrams: 500,
      imageUrl: "www.updatedfakepic.com",
      sellerId: expect.any(Number),
      name: "TP1",
      meatType: "test beef type 1",
      cutType: "test cut type 1",
    });
  });

  test("not found if no such product", async () => {
    const response = await request(app).patch(`/products/213112`).send({
      description: "Updated This is a test description",
      priceInCents: 2000,
      weightInGrams: 500,
      imageUrl: "www.updatedfakepic.com",
    });
    expect(response.statusCode).toEqual(404);
  });

  test("bad request with missing data", async () => {
    let res = await db.query(
      `SELECT product_id AS "productId" FROM products WHERE name = 'TP1'`
    );
    const response = await request(app)
      .patch(`/products/${res.rows[0].productId}`)
      .send({});
    expect(response.statusCode).toEqual(400);
  });
});

/************************************** PATCH /products/:productId/remove */

describe("PATCH /products/:producId/remove", () => {
  test("works", async () => {
    let res = await db.query(
      `SELECT product_id AS "productId" FROM products WHERE name = 'TP1'`
    );
    const response = await request(app).patch(
      `/products/${res.rows[0].productId}/remove`
    );

    let res2 = await db.query(
      `SELECT * FROM products WHERE product_id = $1 AND deleted = FALSE`,
      [res.rows[0].productId]
    );
    expect(res2.rows.length).toEqual(0);
  });

  test("not found if no such product", async () => {
    const response = await request(app).patch(`/products/32238924/remove`);
    expect(response.statusCode).toEqual(404);
  });
});
