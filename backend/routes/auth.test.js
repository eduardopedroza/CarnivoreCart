const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /auth/token */
describe("/POST /auth/token", () => {
  test("works", async () => {
    const response = await request(app).post("/auth/token").send({
      username: "u1",
      password: "password1",
    });
    expect(response.body).toEqual({
      token: expect.any(String),
    });
  });

  test("unauth with non-existent user", async () => {
    const response = await request(app).post("/auth/token").send({
      username: "fakeuser",
      password: "password",
    });
    expect(response.statusCode).toEqual(401);
  });

  test("unauth with wrong password", async () => {
    const response = await request(app).post("/auth/token").send({
      username: "u1",
      password: "fake",
    });
    expect(response.statusCode).toEqual(401);
  });

  test("bad request with missing data", async () => {
    const response = await request(app).post("/auth/token").send({
      username: "u1",
    });
    expect(response.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async () => {
    const response = await request(app).post("/auth/token").send({
      username: 42,
      password: "fakepassword",
    });
    expect(response.statusCode).toEqual(400);
  });
});

/************************************** POST /auth/register */

describe("POST /auth/register", () => {
  test("works for anon", async () => {
    const response = await request(app).post("/auth/register").send({
      username: "new",
      firstName: "first",
      lastName: "last",
      password: "password",
      email: "new@email.com",
      shippingAddress: "test address",
    });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
      token: expect.any(String),
    });
  });

  test("bad request with missing fields", async () => {
    const response = await request(app).post("/auth/register").send({
      username: "new",
    });
    expect(response.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async () => {
    const response = await request(app).post("/auth/register").send({
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
