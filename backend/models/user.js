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
    const duplicateCheck = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

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
       RETURNING username, first_name AS "firstName", last_name AS "lastName", email, shipping_address AS "shippingAddress"`,
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
              shipping_address AS "shippingAddress"
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

  static async findAll() {
    const result = await db.query(
      `SELECT username,
              first_name AS "firstName",
              last_name AS "lastName",
              email,
              shipping_address AS "shippingAddress"
       FROM users
       ORDER BY username`
    );

    return result.rows;
  }

  static async get(username) {
    const result = await db.query(
      `SELECT username,
              first_name AS "firstName",
              last_name AS "lastName",
              email,
              shipping_address AS "shippingAddress"
       FROM users
       WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

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
                      WHERE username = ${usernameVarIdx}
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                shipping_address AS "shippingAddress"`;

    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  static async remove(username) {
    let result = await db.query(
      `DELETE 
       FROM users
       WHERE username = $1
       RETURNING username`,
      [username]
    );

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }
}

module.exports = User;
