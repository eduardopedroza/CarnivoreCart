const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Seller = require("./seller.js");
const Product = require("./product.js");
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
  let sellerOneId, sellerTwoId;
  beforeAll(async function () {
    sellerOneId = await Seller.getSellerId("Ribeyes & Co.");
    sellerTwoId = await Seller.getSellerId("Wings & Co.");
  });
  test("works", async function () {
    const newProduct = {
      sellerId: sellerOneId,
      name: "testProduct",
      description: "testDesc",
      priceInCents: 386,
      meatType: "testMeatType",
      cutType: "testCutType",
      weightInGrams: 500,
      imageUrl: "www.google.com",
    };

    const product = await Product.create(newProduct);

    expect(product).toEqual({
      ...newProduct,
      productId: expect.any(Number),
    });

    const found = await db.query(`SELECT name FROM products WHERE name = $1`, [
      newProduct.name,
    ]);

    expect(found.rows.length).toEqual(1);
  });
});

describe("getAll", function () {
  let sellerOneId, sellerTwoId;
  beforeAll(async function () {
    sellerOneId = await Seller.getSellerId("Ribeyes & Co.");
    sellerTwoId = await Seller.getSellerId("Wings & Co.");
  });

  test("works", async function () {
    const products = await Product.findAll();
    expect(products).toEqual([
      {
        productId: expect.any(Number),
        sellerId: sellerOneId,
        name: "grass-fed ribeye",
        description: "juicy steak",
        priceInCents: 769,
        meatType: "beef",
        cutType: "rib eye",
        weightInGrams: 100,
        imageUrl:
          "https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml",
      },
      {
        productId: expect.any(Number),
        sellerId: sellerTwoId,
        name: "chicken wings",
        description: "very tasty chicken wings",
        priceInCents: 239,
        meatType: "chicken",
        cutType: "chicken wings",
        weightInGrams: 500,
        imageUrl:
          "https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml",
      },
    ]);
  });

  test("works: by seller", async function () {
    const products = await Product.findAll({ sellerId: sellerOneId });
    expect(products).toEqual([
      {
        productId: expect.any(Number),
        sellerId: sellerOneId,
        name: "grass-fed ribeye",
        description: "juicy steak",
        priceInCents: 769,
        meatType: "beef",
        cutType: "rib eye",
        weightInGrams: 100,
        imageUrl:
          "https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml",
      },
    ]);
  });

  test("works: by name", async function () {
    const products = await Product.findAll({ name: "ribeye" });
    expect(products).toEqual([
      {
        productId: expect.any(Number),
        sellerId: sellerOneId,
        name: "grass-fed ribeye",
        description: "juicy steak",
        priceInCents: 769,
        meatType: "beef",
        cutType: "rib eye",
        weightInGrams: 100,
        imageUrl:
          "https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml",
      },
    ]);
  });

  test("works: by meatType", async function () {
    const products = await Product.findAll({ meatType: "chicken" });
    expect(products).toEqual([
      {
        productId: expect.any(Number),
        sellerId: sellerTwoId,
        name: "chicken wings",
        description: "very tasty chicken wings",
        priceInCents: 239,
        meatType: "chicken",
        cutType: "chicken wings",
        weightInGrams: 500,
        imageUrl:
          "https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml",
      },
    ]);
  });

  test("works: by cutType", async function () {
    const products = await Product.findAll({ cutType: "rib eye" });
    expect(products).toEqual([
      {
        productId: expect.any(Number),
        sellerId: sellerOneId,
        name: "grass-fed ribeye",
        description: "juicy steak",
        priceInCents: 769,
        meatType: "beef",
        cutType: "rib eye",
        weightInGrams: 100,
        imageUrl:
          "https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml",
      },
    ]);
  });

  test("works: by minPrice", async function () {
    const products = await Product.findAll({ minPrice: 500 });
    expect(products).toEqual([
      {
        productId: expect.any(Number),
        sellerId: sellerOneId,
        name: "grass-fed ribeye",
        description: "juicy steak",
        priceInCents: 769,
        meatType: "beef",
        cutType: "rib eye",
        weightInGrams: 100,
        imageUrl:
          "https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml",
      },
    ]);
  });

  test("works: by maxPrice", async function () {
    const products = await Product.findAll({ maxPrice: 500 });
    expect(products).toEqual([
      {
        productId: expect.any(Number),
        sellerId: sellerTwoId,
        name: "chicken wings",
        description: "very tasty chicken wings",
        priceInCents: 239,
        meatType: "chicken",
        cutType: "chicken wings",
        weightInGrams: 500,
        imageUrl:
          "https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml",
      },
    ]);
  });

  test("works: by minPrice and maxPrice", async function () {
    const products = await Product.findAll({ minPrice: 200, maxPrice: 500 });
    expect(products).toEqual([
      {
        productId: expect.any(Number),
        sellerId: sellerTwoId,
        name: "chicken wings",
        description: "very tasty chicken wings",
        priceInCents: 239,
        meatType: "chicken",
        cutType: "chicken wings",
        weightInGrams: 500,
        imageUrl:
          "https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml",
      },
    ]);
  });

  test("bad request if minPrice > maxPrice", async function () {
    try {
      await Product.findAll({ minPrice: 500, maxPrice: 200 });
      fail();
    } catch (e) {
      console.log(e);
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("get", function () {
  let sellerOneId, sellerTwoId;
  beforeAll(async function () {
    sellerOneId = await Seller.getSellerId("Ribeyes & Co.");
    sellerTwoId = await Seller.getSellerId("Wings & Co.");
  });
  test("works", async function () {
    const productId = await Product.getProductId("chicken wings", sellerTwoId);

    const product = await Product.get(productId);
    expect(product).toEqual({
      productId: expect.any(Number),
      sellerId: sellerTwoId,
      name: "chicken wings",
      description: "very tasty chicken wings",
      priceInCents: 239,
      meatType: "chicken",
      cutType: "chicken wings",
      weightInGrams: 500,
      imageUrl:
        "https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml",
    });
  });
  test("not found if no such product", async function () {
    try {
      const product = await Product.get(134301);
      fail();
    } catch (e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("update", function () {
  let sellerOneId, sellerTwoId;
  beforeAll(async function () {
    sellerOneId = await Seller.getSellerId("Ribeyes & Co.");
    sellerTwoId = await Seller.getSellerId("Wings & Co.");
  });

  const updateData = {
    description: "testUpdatedDesc",
    priceInCents: 10000,
    weightInGrams: 700,
    imageUrl: "www.testupdate.com",
  };
  test("works", async function () {
    const productId = await Product.getProductId("chicken wings", sellerTwoId);
    const updatedProduct = await Product.update(productId, updateData);
    expect(updatedProduct).toEqual({
      sellerId: sellerTwoId,
      name: "chicken wings",
      description: "testUpdatedDesc",
      priceInCents: 10000,
      meatType: "chicken",
      cutType: "chicken wings",
      weightInGrams: 700,
      imageUrl: "www.testupdate.com",
    });
  });

  test("not found if no such product", async function () {
    try {
      await Product.update(29312, updateData);
      fail();
    } catch (e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if no data", async function () {
    try {
      const productId = await Product.getProductId(
        "chicken wings",
        sellerTwoId
      );
      await Product.update(productId, {});
      fail();
    } catch (e) {
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("remove", function () {
  let sellerOneId, sellerTwoId;
  beforeAll(async function () {
    sellerOneId = await Seller.getSellerId("Ribeyes & Co.");
    sellerTwoId = await Seller.getSellerId("Wings & Co.");
  });

  test("works", async function () {
    const productId = await Product.getProductId("chicken wings", sellerTwoId);
    await Product.remove(productId);
    const response = await db.query(
      `SELECT * FROM products WHERE product_id = $1 AND deleted = FALSE`,
      [productId]
    );
    expect(response.rows.length).toEqual(0);
  });

  test("not found if no such product", async function () {
    try {
      await Product.remove(123847);
      fail();
    } catch (e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });
});
