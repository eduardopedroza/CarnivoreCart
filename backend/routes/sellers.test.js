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
const { NotFoundError } = require("../expressError.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /sellers/register */

describe("POST /sellers/register", () => {
  const newSeller = {
    username: "test s1",
    firstName: "test S1F",
    lastName: "test S1L",
    email: "testseller1@seller.com",
    password: "testpassword1",
    shippingAddress: "test address 4",
    companyName: "Test Seller 1",
    contactInfo: "858-222-2232",
  };

  test("works", async () => {
    const response = await request(app)
      .post(`/sellers/register`)
      .send(newSeller);
    expect(response.body).toHaveProperty("token");
  });

  test("bad request with missing fields", async () => {
    const response = await request(app).post("/sellers/register").send({
      username: "new",
    });
    expect(response.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async () => {
    const response = await request(app).post("/sellers/register").send({
      username: "new",
      firstName: "first",
      lastName: "last",
      password: "password",
      email: "fakeemail",
      shippingAddress: "test address",
    });
    expect(response.statusCode).toEqual(400);
  });
});

/************************************** GET /users/:sellerId */

describe("GET /sellers/:sellerId", () => {
  test("works", async () => {
    const response = await request(app).get(`/sellers/${getSellerOneId()}`);
    expect(response.body.seller).toEqual({
      companyName: "Seller 1",
      contactInfo: "858-222-2222",
      rating: null,
      salesCount: 0,
    });
  });

  test("not found if no such user", async () => {
    const response = await request(app).get(`/sellers/${92948}`);
    expect(response.statusCode).toEqual(404);
  });
});

/************************************** PATCH /sellers/:sellerId */

describe("PATCH /sellers/:sellerId", () => {
  test("works", async () => {
    const response = await request(app)
      .patch(`/sellers/${getSellerOneId()}`)
      .send({
        firstName: "test update",
        lastName: "test update",
        email: "testupdate@email.com",
        shippingAddress: "test update",
        companyName: "Updated Company Name",
        contactInfo: "858-555-5555",
      });
    expect(response.body.seller).toEqual({
      username: "s1",
      firstName: "test update",
      lastName: "test update",
      email: "testupdate@email.com",
      shippingAddress: "test update",
      companyName: "Updated Company Name",
      contactInfo: "858-555-5555",
      rating: null,
      salesCount: 0,
    });
  });

  test("not found with no such user", async () => {
    const response = await request(app).patch(`/sellers/${324212}`).send({
      firstName: "test update",
      lastName: "test update",
      email: "testupdate@email.com",
      shippingAddress: "test update",
      companyName: "Updated Company Name",
      contactInfo: "858-555-5555",
    });
    expect(response.statusCode).toEqual(404);
  });

  test("bad request with missing data", async () => {
    const response = await request(app)
      .patch(`/sellers/${getSellerOneId()}`)
      .send({});
    expect(response.statusCode).toEqual(400);
  });
});

describe("PATCH /sellers/:sellerId/remove", () => {
  test("works", async () => {
    const response = await request(app).patch(
      `/sellers/${getSellerOneId()}/remove`
    );
    const sellerRes = await db.query(
      `SELECT * FROM sellers WHERE seller_id = $1 AND deleted = FALSE`,
      [getSellerOneId()]
    );
    const userRes = await db.query(
      `SELECT * FROM users WHERE user_id = $1 AND deleted = FALSE`,
      [getSellerOneId()]
    );
    expect(sellerRes.rows.length).toEqual(0);
    expect(userRes.rows.length).toEqual(0);
  });

  test("not found if no such seller", async () => {
    const response = await request(app).patch(`/sellers/${1241212}/remove`);
    expect(response.statusCode).toEqual(404);
  });
});
