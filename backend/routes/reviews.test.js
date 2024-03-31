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
  getUserOneId,
  getProductOneId,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /reviews/create */

describe("POST /reviews/create", () => {
  test("works", async () => {
    const newReview = {
      userId: getUserOneId().toString(),
      productId: getProductOneId().toString(),
      rating: "2.6",
      comment: "taste decent",
    };

    const response = await request(app).post(`/reviews/create`).send(newReview);

    expect(response.body.review).toEqual({
      userId: getUserOneId(),
      productId: getProductOneId(),
      rating: "2.6",
      comment: "taste decent",
    });
  });
});

/************************************** PATCH /reviews/:reviewId */

describe("PATCH /reviews/:reviewId", () => {
  test("works", async () => {
    const updateData = {
      rating: "4.6",
      comment: "test update",
    };

    const res = await db.query(
      `SELECT review_id AS "reviewId" FROM reviews WHERE product_id = $1`,
      [getProductOneId()]
    );
    const response = await request(app)
      .patch(`/reviews/${res.rows[0].reviewId}`)
      .send(updateData);

    expect(response.body.review).toEqual({
      userId: expect.any(Number),
      productId: getProductOneId(),
      rating: "4.6",
      comment: "test update",
      reviewDate: expect.any(String),
    });
  });

  test("not found if no such review", async () => {
    const updateData = {
      rating: "4.6",
      comment: "test update",
    };

    const response = await request(app).patch(`/reviews/1231`).send(updateData);

    expect(response.statusCode).toEqual(404);
  });

  test("bad request if missing data", async () => {
    const res = await db.query(
      `SELECT review_id AS "reviewId" FROM reviews WHERE product_id = $1`,
      [getProductOneId()]
    );
    const response = await request(app)
      .patch(`/reviews/${res.rows[0].reviewId}`)
      .send({});

    expect(response.statusCode).toEqual(400);
  });
});

/************************************** PATCH /reviews/:reviewId/remove */

describe("PATCH /reviews/:reviewId/remove", () => {
  test("works", async () => {
    const res1 = await db.query(
      `SELECT review_id AS "reviewId" FROM reviews WHERE product_id = $1`,
      [getProductOneId()]
    );
    let reviewId = res1.rows[0].reviewId;

    const response = await request(app).patch(`/reviews/${reviewId}/remove`);

    const res2 = await db.query(
      `SELECT * FROM reviews WHERE product_id = $1 AND deleted = FALSE`,
      [getProductOneId()]
    );
    expect(res2.rows.length).toEqual(0);
  });

  test("not found if no such review", async () => {
    const response = await request(app).patch(`/reviews/12312/remove`);
    expect(response.statusCode).toEqual(404);
  });
});
