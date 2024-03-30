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
   * Returns { sellerId, companyName, contactInfo }
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
       RETURNING seller_id AS "sellerId", company_name AS "companyName", contact_info AS "contactInfo"`,
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
       WHERE deleted = FALSE`
    );

    return result.rows;
  }

  /** Given a company name, return data about seller
   *
   * Returns { companyName, contactInfo, rating, salesCount }
   *
   * Throws NotFoundError if not found or set to deleted
   */
  static async get(companyName) {
    const result = await db.query(
      `SELECT company_name AS "companyName",
              contact_info AS "contactInfo",
              rating,
              sales_count AS "salesCount"
       FROM sellers
       WHERE company_name = $1 AND deleted = FALSE`,
      [companyName]
    );

    const seller = result.rows[0];

    if (!seller) throw new NotFoundError(`No seller: ${companyName}`);

    return seller;
  }

  /** Given a sellerId, return data about seller
   *
   * Returns { companyName, contactInfo, rating, salesCount }
   *
   * Throws NotFoundError if not found or set to deleted
   */
  static async getSellerWithId(sellerId) {
    const result = await db.query(
      `SELECT company_name AS "companyName",
              contact_info AS "contactInfo",
              rating,
              sales_count AS "salesCount"
       FROM sellers
       WHERE seller_id = $1 AND deleted = FALSE`,
      [sellerId]
    );

    const seller = result.rows[0];

    if (!seller) throw new NotFoundError(`No seller with Id: ${sellerId}`);

    return seller;
  }

  /** Update seller data with 'data'
   *
   * Data can include: { password, firstName, lastName, email,
                        shippingAddress, companyName, contactInfo }
   *
   * Returns { username, firstName, lastName, email, shippingAddress
   *           companyName, contactInfo, rating, salesCount }
   *
   * Throws NotFoundError if seller not found or set to deleted
   */

  static async update(sellerId, data) {
    if (Object.keys(data).length === 0)
      throw new BadRequestError(`Missing data`);
    const { companyName, contactInfo, ...restOfData } = data;
    const { setCols, values } = createSqlSetClause(
      { companyName, contactInfo },
      {
        companyName: "company_name",
        contactInfo: "contact_info",
      }
    );

    const sellerVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE sellers
                      SET ${setCols}
                      WHERE seller_id = ${sellerVarIdx} AND deleted = FALSE
                      RETURNING company_name AS "companyName",
                      contact_info AS "contactInfo",
                      rating,
                      sales_count AS "salesCount"`;

    const result = await db.query(querySql, [...values, sellerId]);
    const updatedSeller = result.rows[0];

    if (!updatedSeller) {
      throw new NotFoundError(`No seller found with ID: ${sellerId}`);
    }

    const sellerUser = await User.getUserWithId(sellerId);

    const updatedSellerUser = await User.update(
      sellerUser.username,
      restOfData
    );

    const seller = {
      username: updatedSellerUser.username,
      firstName: updatedSellerUser.firstName,
      lastName: updatedSellerUser.lastName,
      email: updatedSellerUser.email,
      shippingAddress: updatedSellerUser.shippingAddress,
      companyName: updatedSeller.companyName,
      contactInfo: updatedSeller.contactInfo,
      rating: updatedSeller.rating,
      salesCount: updatedSeller.salesCount,
    };

    return seller;
  }

  /** Delete given seller from database, returns undefined
   *
   * Finds seller from database
   *
   * Throws NotFoundError if seller not found
   *
   * Sets seller and user as deleted
   */

  static async remove(sellerId) {
    const seller = await this.getSellerWithId(sellerId);

    await db.query(
      `UPDATE users
       SET deleted = TRUE
       WHERE user_id = $1`,
      [sellerId]
    );

    await db.query(
      `UPDATE sellers
       SET deleted = TRUE
       WHERE seller_id = $1`,
      [sellerId]
    );
  }
  /** Given a company name, get seller id
   *
   * Returns { sellerId }
   *
   * Throws NotFoundError if not found or set to deleted
   */
  static async getSellerId(companyName) {
    const result = await db.query(
      `SELECT seller_id AS "sellerId"
         from sellers
         WHERE company_name = $1 AND deleted = FALSE`,
      [companyName]
    );

    const sellerId = result.rows[0].sellerId;

    if (!sellerId) throw new NotFoundError(`No company named: ${companyName}`);

    return sellerId;
  }
}

module.exports = Seller;
