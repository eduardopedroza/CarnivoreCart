const db = require("../db");

const User = require("../models/user");
const Seller = require("../models/seller");
const Product = require("../models/product");
const Order = require("../models/order");
const Review = require("../models/review");

const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  await db.query("DELETE FROM orders");
  await db.query("DELETE FROM reviews");
  await db.query("DELETE FROM products");
  await db.query("DELETE FROM sellers");
  await db.query("DELETE FROM users");

  const userOne = await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    shippingAddress: "test address 1",
  });
  const userTwo = await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    shippingAddress: "test address 2",
  });
  const userThree = await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    shippingAddress: "test address 3",
  });

  const sellerOne = await Seller.create({
    username: "s1",
    firstName: "S1F",
    lastName: "S1L",
    email: "seller1@seller.com",
    password: "password1",
    shippingAddress: "test address 4",
    companyName: "Seller 1",
    contactInfo: "858-222-2222",
  });
  const sellerTwo = await Seller.create({
    username: "s2",
    firstName: "S2F",
    lastName: "S2L",
    email: "seller2@seller.com",
    password: "password1",
    shippingAddress: "test address 5",
    companyName: "Seller 2",
    contactInfo: "858-222-2223",
  });

  const productOne = await Product.create({
    sellerId: sellerOne.sellerId,
    name: "TP1",
    description: "This is a test description",
    priceInCents: 1000,
    meatType: "test beef type 1",
    cutType: "test cut type 1",
    weightInGrams: 300,
    imageUrl: "www.fakepic.com",
  });

  const productTwo = await Product.create({
    sellerId: sellerOne.sellerId,
    name: "TP2",
    description: "This is a test description",
    priceInCents: 2000,
    meatType: "test beef type 2",
    cutType: "test cut type 2",
    weightInGrams: 300,
    imageUrl: "www.fakepic.com",
  });

  const productThree = await Product.create({
    sellerId: sellerTwo.sellerId,
    name: "TP2",
    description: "This is a test description",
    priceInCents: 2000,
    meatType: "test beef type 3",
    cutType: "test cut type 3",
    weightInGrams: 300,
    imageUrl: "www.fakepic.com",
  });

  const orderOne = await Order.create({
    userId: userOne.userId,
    products: [
      {
        productId: productThree.productId,
        quantity: 2,
        priceInCents: productThree.priceInCents,
      },
    ],
    pricePaidInCents: 2 * productThree.priceInCents,
  });

  const orderTwo = await Order.create({
    userId: userTwo.userId,
    products: [
      {
        productId: productOne.productId,
        quantity: 1,
        priceInCents: productOne.priceInCents,
      },
      {
        productId: productTwo.productId,
        quantity: 2,
        priceInCents: productTwo.priceInCents,
      },
    ],
    pricePaidInCents: productOne.priceInCents + 2 * productTwo.priceInCents,
  });

  const reviewOne = await Review.create({
    userId: userOne.userId,
    productId: productThree.productId,
    rating: 3.9,
    comment: "decent cut",
  });

  const reviewTwo = await Review.create({
    userId: userTwo.userId,
    productId: productOne.productId,
    rating: 4.5,
    comment: "awesome cut",
  });
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const u1Token = createToken({ username: "u1" });
const u2Token = createToken({ username: "u2" });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
};
