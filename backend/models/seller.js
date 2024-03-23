const db = require("../db");
const User = require("./user");
const { createSqlSetClause } = require("../helpers/sql");
const { BadRequestError, NotFoundError } = require("../expressError");

class Seller {
  /** Create seller profile
   *
   * data should be {firstName, lastName, username, email, password
   *                 shippingAddress, companyName, contactInfo}
   *
   * Returns { seller_id, companyName, contactInfo, rating, salesCount}
   *
   * Throws BadRequestError if username or companyName already in database
   */

  static async create({
    username,
    password,
    firstName,
    lastName,
    email,
    shippingAddress,
    companyName,
    contactInfo,
  }) {
    await User.register({
      username,
      password,
      firstName,
      lastName,
      email,
      shippingAddress,
    });

    const companyDuplicateCheck = await db.query(
      `SELECT company_name
       FROM sellers
       WHERE company_name = $1`,
      [companyName]
    );

    if (companyDuplicateCheck.rows[0])
      throw new BadRequestError(`Company name already exists: ${companyName}`);

    const userResult = await db.query(
      `SELECT user_id
       FROM users
       WHERE username = $1`,
      [username]
    );

    const userId = userResult.rows[0].user_id;

    const sellerResult = await db.query(
      `INSERT INTO sellers(seller_id, company_name, contact_info)
       VALUES ($1, $2, $3)
       RETURNING company_name AS "companyName", contact_info AS "contactInfo"`,
      [userId, companyName, contactInfo]
    );

    const seller = sellerResult.rows[0];

    return seller;
  }

  /** Find all sellers
   *
   * Returns [{ companyName, contactInfo, rating, salesCount }]
   */
  static async findAll() {
    const result = await db.query(
      `SELECT company_name AS "companyName",
              contact_info AS "contactInfo",
              rating,
              sales_count AS "salesCount"
       FROM sellers
       ORDER BY company_name`
    );

    return result.rows;
  }

  /** Given a company name, return data about seller
   *
   * Returns { companyName, contactInfo, rating, salesCount }
   *
   * Throws NotFoundError if not found
   */
  static async get(companyName) {
    const result = await db.query(
      `SELECT company_name AS "companyName",
              contact_info AS "contactInfo",
              rating,
              sales_count AS "salesCount"
       FROM sellers
       WHERE company_name = $1`,
      [companyName]
    );

    const seller = result.rows[0];

    if (!seller) throw new NotFoundError(`No seller: ${companyName}`);

    return seller;
  }

  /** Update seller data with 'data'
   *
   * Data can include: { companyName, contactInfo }
   *
   * Returns { companyName, contactInfo, rating, salesCount }
   *
   * Throws NotFoundError if seller not found
   */

  static async update(sellerId, data) {
    const { setCols, values } = createSqlSetClause(data, {
      companyName: "company_name",
      contactInfo: "contact_info",
    });

    const sellerVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE sellers
                      SET ${setCols}
                      WHERE seller_id = ${sellerVarIdx}
                      RETURNING company_name AS "companyName",
                      contact_info AS "contactInfo",
                      rating,
                      sales_count AS "salesCount"`;

    const result = await db.query(querySql, [...values, sellerId]);
    const seller = result.rows[0];

    if (!seller) {
      throw new NotFoundError(`No seller found with ID: ${sellerId}`);
    }

    return seller;
  }

  /** Delete given seller from database, returns undefined
   *
   * Finds seller from database
   *
   * Throws NotFoundError if seller not found
   *
   * Removes user from database, cascades to the sellers table due to the foreign key constraint
   */

  static async remove(sellerId) {
    const seller = await db.query(
      `SELECT *
       FROM sellers
       WHERE seller_id = $1`,
      [sellerId]
    );

    if (seller.rows.length === 0)
      throw new NotFoundError(`Seller with ID ${sellerId} not found`);

    await db.query(
      `DELETE FROM users
        WHERE user_id = $1`,
      [sellerId]
    );
  }
  /** Given a company name, get seller id
   *
   * Returns { sellerId }
   *
   * Throws NotFoundError if not found
   */
  static async getSellerId(companyName) {
    const result = await db.query(
      `SELECT seller_id AS "sellerId"
         from sellers
         WHERE company_name = $1`,
      [companyName]
    );

    const sellerId = result.rows[0];

    if (!sellerId) throw new NotFoundError(`No company named: ${companyName}`);

    return sellerId;
  }
}

module.exports = Seller;
