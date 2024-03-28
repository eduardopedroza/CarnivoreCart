const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Seller = require("./seller.js");
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

describe("create", function () {
  const newSeller = {
    username: "newSeller",
    firstName: "TestSeller",
    lastName: "TesterSeller",
    email: "testseller@test.com",
    shippingAddress: "123 Test Seller Lane",
    companyName: "Test Company",
    contactInfo: "858-222-2222",
  };

  test("works", async function () {
    const seller = await Seller.create({
      ...newSeller,
      password: "password",
    });
    expect(seller).toEqual({
      companyName: "Test Company",
      contactInfo: "858-222-2222",
    });
    const found = await db.query(
      "SELECT FROM sellers WHERE company_name = 'Test Company'"
    );
    expect(found.rows.length).toEqual(1);
  });

  test("bad request with duplicate company name", async function () {
    try {
      await Seller.create({
        ...newSeller,
        password: "password",
      });

      newSeller.username = "newSellerTwo";
      newSeller.email = "diffemail@gmail.com";

      await Seller.create({
        ...newSeller,
        password: "password",
      });
      fail();
    } catch (e) {
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("getAll", function () {
  test("works", async function () {
    const sellers = await Seller.findAll();
    expect(sellers).toEqual([
      {
        companyName: "Ribeyes & Co.",
        contactInfo: "ribeyesandco@gmail.com",
        rating: "4.80",
        salesCount: 2442,
      },
      {
        companyName: "Wings & Co.",
        contactInfo: "wingsandco@gmail.com",
        rating: "3.70",
        salesCount: 428,
      },
    ]);
  });
});

describe("get", function () {
  test("works", async function () {
    const seller = await Seller.get("Ribeyes & Co.");
    expect(seller).toEqual({
      companyName: "Ribeyes & Co.",
      contactInfo: "ribeyesandco@gmail.com",
      rating: "4.80",
      salesCount: 2442,
    });
  });

  test("not found if no such seller", async function () {
    try {
      const seller = await Seller.get("fake company");
      fail();
    } catch (e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("update", function () {
  const updateData = {
    companyName: "Updated Company Name",
    contactInfo: "858-555-5555",
  };

  test("works", async function () {
    const sellerId = await Seller.getSellerId("Ribeyes & Co.");
    const updatedSeller = await Seller.update(sellerId, updateData);
    expect(updatedSeller).toEqual({
      companyName: "Updated Company Name",
      contactInfo: "858-555-5555",
      rating: "4.80",
      salesCount: 2442,
    });
  });

  test("not found if no such seller", async function () {
    try {
      await Seller.update(9999, updateData);
      fail();
    } catch (e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if no data", async function () {
    try {
      const sellerId = await Seller.getSellerId("Ribeyes & Co.");
      await Seller.update(sellerId, {});
      fail();
    } catch (e) {
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("remove", function () {
  test("works", async function () {
    const sellerId = await Seller.getSellerId("Ribeyes & Co.");
    await Seller.remove(sellerId);
    const response = await db.query(
      `SELECT * FROM sellers WHERE seller_id = $1 AND deleted = FALSE`,
      [sellerId]
    );
    expect(response.rows.length).toEqual(0);
  });

  test("not found if no such seller", async function () {
    try {
      await Seller.remove(9999);
      fail();
    } catch (e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });
});
