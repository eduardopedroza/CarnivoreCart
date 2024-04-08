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
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /users/:username */

describe("GET /users/:username", () => {
  test("works for same user", async () => {
    const response = await request(app)
      .get(`/users/u1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(response.body).toEqual({
      user: {
        userId: expect.any(Number),
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        shippingAddress: "test address 1",
        isSeller: false,
      },
    });
  });

  test("unauth for other users", async () => {
    const response = await request(app)
      .get(`/users/u1`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(response.statusCode).toEqual(401);
  });

  test("unauth for anon", async () => {
    const response = await request(app).get(`/users/u1`);
    expect(response.statusCode).toEqual(401);
  });
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", () => {
  test("works for same user", async () => {
    const response = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: "New",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(response.body).toEqual({
      user: {
        username: "u1",
        firstName: "New",
        lastName: "U1L",
        email: "user1@user.com",
        shippingAddress: "test address 1",
        isSeller: false,
      },
    });
  });

  test("unauth if not same user", async () => {
    const response = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: "New",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(response.statusCode).toEqual(401);
  });

  test("unauth for anon", async () => {
    const response = await request(app).patch(`/users/u1`).send({
      firstName: "New",
    });
    expect(response.statusCode).toEqual(401);
  });
});
