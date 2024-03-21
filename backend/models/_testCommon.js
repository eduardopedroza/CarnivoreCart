const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
  // Clear tables
  await db.query("DELETE FROM orders");
  await db.query("DELETE FROM reviews");
  await db.query("DELETE FROM products");
  await db.query("DELETE FROM sellers");
  await db.query("DELETE FROM users");

  // Insert users
  const hashedPassword1 = await bcrypt.hash("password1", BCRYPT_WORK_FACTOR);
  const hashedPassword2 = await bcrypt.hash("password2", BCRYPT_WORK_FACTOR);

  const userInsertResult = await db.query(
    `INSERT INTO users(username, password, first_name, last_name, email, shipping_address)
     VALUES ($1, $2, 'u1f', 'u1l', 'u1@gmail.com', '123 test 1 lane'),
            ($3, $4, 'u2f', 'u2l', 'u2@gmail.com', '123 test 2 lane')
     RETURNING user_id`,
    ["user1", hashedPassword1, "user2", hashedPassword2]
  );

  const userIdsArray = userInsertResult.rows.map((row) => row.user_id);

  // Insert sellers
  const sellerInsertResult = await db.query(
    `INSERT INTO sellers(seller_id, company_name, contact_info, rating, sales_count)
     VALUES ($1, 'Ribeyes & Co.', 'ribeyesandco@gmail.com', 4.8, 2442),
            ($2, 'Wings & Co.', 'wingsandco@gmail.com', 3.7, 428)
     RETURNING seller_id`,
    [userIdsArray[0], userIdsArray[1]]
  );

  const sellerIdsArray = sellerInsertResult.rows.map((row) => row.seller_id);

  // Insert products
  const productInsertResult = await db.query(
    `
    INSERT INTO products(seller_id, name, description, price, meat_type, cut_type, weight, image_url)
    VALUES ($1, 'grass-fed ribeye', 'juicy steak', 7.69, 'beef', 'rib eye', 1000, 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml'),
           ($2, 'chicken wings', 'very tasty chicken wings', 2.39, 'chicken', 'chicken wings', 500, 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml')
    RETURNING product_id`,
    [sellerIdsArray[0], sellerIdsArray[1]]
  );

  const productIdsArray = productInsertResult.rows.map((row) => row.product_id);

  // Insert reviews
  await db.query(
    `INSERT INTO reviews(user_id, product_id, rating, comment, review_date)
     VALUES ($1, $2, 4.8, 'amazing steak', '2024-03-18 09:30:00'),
            ($3, $4, 3.5, 'awesome chicken wings', '2024-03-18 09:40:00')`,
    [userIdsArray[0], productIdsArray[0], userIdsArray[1], productIdsArray[1]]
  );

  // Insert orders
  await db.query(
    `INSERT INTO orders(user_id, product_id, quantity, order_date, status)
     VALUES ($1, $2, 10, '2024-03-18 09:00:00', 'shipped'),
            ($3, $4, 5, '2024-03-18 10:00:00', 'delivered')`,
    [userIdsArray[0], productIdsArray[0], userIdsArray[1], productIdsArray[1]]
  );
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

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};