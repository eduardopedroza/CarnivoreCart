const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Review = require("./review.js");
const Product = require("./product.js");
const User = require("./user.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  getUserIdsArray,
  getProductIdsArray,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", function () {
  let userId, productId;
  beforeAll(async function () {
    let result1 = await db.query(
      `SELECT user_id
       FROM users
       WHERE username = 'user1'`
    );
    userId = result1.rows[0].user_id;

    let result2 = await db.query(
      `SELECT product_id
       FROM products
       WHERE name = 'chicken wings'`
    );
    productId = result2.rows[0].product_id;
  });

  test("works", async function () {
    const newReview = {
      userId,
      productId,
      rating: "2.7",
      comment: "needs way less salt",
    };
    const review = await Review.create(newReview);

    expect(review).toEqual(newReview);
  });
});

describe("findAll", function () {
  test("works", async function () {
    let productIds = getProductIdsArray();
    let userIds = getUserIdsArray();
    let reviews = await Review.findAll();
    expect(reviews).toEqual([
      {
        userId: userIds[0],
        productId: productIds[0],
        rating: "4.8",
        comment: "amazing steak",
        reviewDate: new Date("2024-03-18T15:30:00.000Z"),
      },
      {
        userId: userIds[1],
        productId: productIds[1],
        rating: "3.5",
        comment: "awesome chicken wings",
        reviewDate: new Date("2024-03-18T15:40:00.000Z"),
      },
    ]);
  });
});

describe("get", function () {
  test("works", async function () {
    let userIds = getUserIdsArray();
    let productIds = getProductIdsArray();
    let result = await db.query(
      `SELECT review_id
       FROM reviews
       WHERE rating = 3.5`
    );
    let reviewId = result.rows[0].review_id;
    let review = await Review.get(reviewId);
    expect(review).toEqual({
      reviewId: expect.any(Number),
      userId: userIds[1],
      productId: productIds[1],
      rating: "3.5",
      comment: "awesome chicken wings",
      reviewDate: new Date("2024-03-18T15:40:00.000Z"),
    });
  });

  test("not found if no such review", async function () {
    try {
      let review = await Review.get(34131);
      fail();
    } catch (e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("update", function () {
  test("works", async function () {
    let userIds = getUserIdsArray();
    let productIds = getProductIdsArray();
    let result = await db.query(
      `SELECT review_id
       FROM reviews
       WHERE rating = '3.5'`
    );
    let reviewId = result.rows[0].review_id;
    const updateData = {
      rating: 4.9,
      comment: "test update",
    };
    const review = await Review.update(reviewId, updateData);

    expect(review).toEqual({
      userId: userIds[1],
      productId: productIds[1],
      rating: "4.9",
      comment: "test update",
      reviewDate: new Date("2024-03-18T15:40:00.000Z"),
    });
  });

  test("not found if no such review", async () => {
    try {
      const updateData = {
        rating: 4.9,
        comment: "test update",
      };
      const review = await Review.update(1281031, updateData);
      fail();
    } catch (e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if missing data", async () => {
    try {
      let result = await db.query(
        `SELECT review_id
         FROM reviews
         WHERE rating = '3.5'`
      );
      let reviewId = result.rows[0].review_id;
      const review = await Review.update(reviewId, {});
      fail();
    } catch (e) {
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("remove", function () {
  test("works", async function () {
    let result = await db.query(
      `SELECT review_id
       FROM reviews
       WHERE rating = '3.5'`
    );
    let reviewId = result.rows[0].review_id;
    await Review.remove(reviewId);
    let found = await db.query(
      `SELECT * FROM reviews WHERE rating = '3.5' AND deleted = FALSE`
    );
    expect(found.rows.length).toBe(0);
  });

  test("not found if no such review", async function () {
    try {
      await Review.remove(213141);
      fail();
    } catch (e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });
});
