const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");
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

describe("register", function () {
  const newUser = {
    username: "new",
    firstName: "Test",
    lastName: "Tester",
    email: "test@test.com",
    shippingAddress: "123 Test Lane",
  };

  test("works", async function () {
    const user = await User.register({
      ...newUser,
      password: "password",
    });
    expect(user).toEqual(newUser);
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with duplicate username", async function () {
    try {
      await User.register({
        ...newUser,
        password: "password",
      });
      newUser.email = "diffemail@gmail.com";
      await User.register({
        ...newUser,
        password: "password",
      });
      fail();
    } catch (e) {
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  });

  test("bad request with duplicate email", async function () {
    try {
      await User.register({
        ...newUser,
        password: "password",
      });
      newUser.username = "new2";
      await User.register({
        ...newUser,
        password: "password",
      });
      fail();
    } catch (e) {
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("authenticate", function () {
  test("works", async function () {
    const user = await User.authenticate("user1", "password1");
    expect(user).toEqual({
      username: "user1",
      firstName: "u1f",
      lastName: "u1l",
      email: "u1@gmail.com",
      shippingAddress: "123 test 1 lane",
    });
  });

  test("unauth if no such user", async function () {
    try {
      await User.authenticate("fakeuser", "password");
      fail();
    } catch (e) {
      expect(e instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if wrong password", async function () {
    try {
      await User.authenticate("user1", "wrongpassword");
      fail();
    } catch (e) {
      expect(e instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

describe("findAll", function () {
  test("works", async function () {
    const users = await User.findAll();
    expect(users).toEqual([
      {
        username: "user1",
        firstName: "u1f",
        lastName: "u1l",
        email: "u1@gmail.com",
        shippingAddress: "123 test 1 lane",
      },
      {
        username: "user2",
        firstName: "u2f",
        lastName: "u2l",
        email: "u2@gmail.com",
        shippingAddress: "123 test 2 lane",
      },
    ]);
  });
});

describe("get", function () {
  test("works", async function () {
    const user = await User.get("user1");
    expect(user).toEqual({
      username: "user1",
      firstName: "u1f",
      lastName: "u1l",
      email: "u1@gmail.com",
      shippingAddress: "123 test 1 lane",
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.get("fakeuser");
      fail();
    } catch (e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("update", function () {
  const updateData = {
    firstName: "updatedU1",
    lastName: "updatedU1f",
    email: "new@gmail.com",
    shippingAddress: "1234 Updated Lane",
  };

  test("works", async function () {
    const updatedUser = await User.update("user1", updateData);
    expect(updatedUser).toEqual({
      username: "user1",
      firstName: "updatedU1",
      lastName: "updatedU1f",
      email: "new@gmail.com",
      shippingAddress: "1234 Updated Lane",
    });
  });

  test("works: set password", async function () {
    const updatedUser = await User.update("user1", {
      password: "new",
    });
    expect(updatedUser).toEqual({
      username: "user1",
      firstName: "u1f",
      lastName: "u1l",
      email: "u1@gmail.com",
      shippingAddress: "123 test 1 lane",
    });
    const found = await db.query(
      "SELECT * FROM users WHERE username = 'user1'"
    );
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("not found if no such user", async function () {
    try {
      await User.update("fakeuser", {
        firstName: "test",
      });
      fail();
    } catch (e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if no data", async function () {
    expect.assertions(1);
    try {
      await User.update("user1", {});
      fail();
    } catch (e) {
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("remove", function () {
  test("works", async function () {
    await User.remove("user1");
    const response = await db.query(
      "SELECT * FROM users WHERE username = 'user1' AND deleted = FALSE"
    );
    expect(response.rows.length).toEqual(0);
  });

  test("not found if no such user", async function () {
    try {
      await User.remove("fakeuser");
      fail();
    } catch (e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });
});
