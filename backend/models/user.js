const db = require("../db");
const bcrypt = require("bcrypt");
const { createSqlSetClause } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

class User {
  /** Register user with data
   *
   * Returns { username, firstName, lastName, email, shippingAddress }
   *
   * Throws BadRequestError on duplicates
   */
  static async register({
    username,
    password,
    firstName,
    lastName,
    email,
    shippingAddress,
  }) {
    const duplicateUsernameCheck = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`,
      [username]
    );

    if (duplicateUsernameCheck.rows[0])
      throw new BadRequestError(`Duplicate username: ${username}`);

    const duplicateEmailCheck = await db.query(
      `SELECT email
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (duplicateEmailCheck.rows[0])
      throw new BadRequestError(`Duplicate email: ${email}`);

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
       (username,
        password,
        first_name,
        last_name,
        email,
        shipping_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id AS "userId", username, first_name AS "firstName", last_name AS "lastName", email, shipping_address AS "shippingAddress", is_seller AS "isSeller"`,
      [username, hashedPassword, firstName, lastName, email, shippingAddress]
    );

    const user = result.rows[0];

    return user;
  }

  /** Authenticate user wih username and password
   *
   * Returns { username, first_name, last_name, email, shipping_address }
   *
   * Throws UnauthorizedErros if user not found or wrong password.
   */
  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT username,
              password,
              first_name AS "firstName",
              last_name AS "lastName",
              email,
              shipping_address AS "shippingAddress",
              is_seller AS "isSeller"
       FROM users
       WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];
    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }
    throw new UnauthorizedError("Invalid username/password");
  }

  /** Find all users
   *
   * Returns [{ username, firstName, lastName, email, shippingAddress }]
   */
  static async findAll() {
    const result = await db.query(
      `SELECT username,
              first_name AS "firstName",
              last_name AS "lastName",
              email,
              shipping_address AS "shippingAddress",
              is_seller AS "isSeller"
       FROM users
       WHERE deleted = FALSE`
    );

    return result.rows;
  }

  /** Given a username, return user
   *
   * Returns { userId, username, firstName, lastName, email, shippingAddress }
   *
   * Throws NotFoundError if not found or set to deleted
   */
  static async get(username) {
    const result = await db.query(
      `SELECT user_id AS "userId",
              username,
              first_name AS "firstName",
              last_name AS "lastName",
              email,
              shipping_address AS "shippingAddress",
              is_seller AS "isSeller"
       FROM users
       WHERE username = $1 AND deleted = FALSE`,
      [username]
    );

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /** Given a userId, return user
   *
   * Returns { username, firstName, lastName, email, shippingAddress }
   *
   * Throws NotFoundError if not found or set to deleted
   */
  static async getUserWithId(userId) {
    const result = await db.query(
      `SELECT username,
              first_name AS "firstName",
              last_name AS "lastName",
              email,
              shipping_address AS "shippingAddress",
              is_seller AS "isSeller"
       FROM users
       WHERE user_id = $1 AND deleted = FALSE`,
      [userId]
    );

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user with ID: ${userId}`);

    return user;
  }

  /** Update a user with 'data'
   *
   * Data can include: { password, firstName, lastName, shippingAddress }
   *
   * Returns { username, firstName, lastName, email, shippingAddress }
   *
   * Throws NotFoundError if user is not found or set to deleted
   */
  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = createSqlSetClause(data, {
      firstName: "first_name",
      lastName: "last_name",
      shippingAddress: "shipping_address",
    });

    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users
                      SET ${setCols}
                      WHERE username = ${usernameVarIdx} AND deleted = FALSE
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                shipping_address AS "shippingAddress",
                                is_seller AS "isSeller"`;

    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Set given user as deleted; returns undefined
   *
   * Throws NotFoundError if user not found
   */
  static async remove(username) {
    const user = await this.get(username);

    await db.query(
      `UPDATE users
       SET deleted = TRUE
       WHERE username = $1`,
      [username]
    );
  }
}

module.exports = User;
