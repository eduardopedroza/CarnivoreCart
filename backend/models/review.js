const db = require("../db");
const User = require("./user");
const Product = require("./product");
const { createSqlSetClause } = require("../helpers/sql");
const { BadRequestError, NotFoundError } = require("../expressError");

class Review {
  /** Create review
   *
   * data should be { userId, productId, rating, comment }
   *
   * Returns { userId, productId, rating, comment }
   *
   * Throws NotFoundError if user or product are not in database
   */

  static async create({ userId, productId, rating, comment }) {
    const user = await User.getUserWithId(userId);
    const product = await Product.get(productId);

    const result = await db.query(
      `INSERT INTO reviews(user_id, product_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id AS "userId",
                 product_id AS "productId",
                 rating,
                 comment`,
      [userId, productId, rating, comment]
    );

    const review = result.rows[0];

    return review;
  }

  /** Find all reviews
   *
   * returns [{ userId, productId, rating, comment }]
   */

  static async findAll() {
    const reviews = await db.query(
      `SELECT user_id AS "userId",
              product_id AS "productId",
              rating,
              comment,
              review_date AS "reviewDate"
       FROM reviews
       WHERE deleted = FALSE`
    );

    return reviews.rows;
  }

  /** Given a reviewId, return review
   *
   * returns { reviewId, userId, productId, rating, comment, reviewDate }
   *
   * Throws NotFoundError if user not found or if user set to deleted
   */
  static async get(reviewId) {
    const result = await db.query(
      `SELECT review_id AS "reviewId",
              user_id AS "userId",
              product_id AS "productId",
              rating,
              comment,
              review_date AS "reviewDate"
       FROM reviews
       WHERE review_id = $1 AND NOT deleted`,
      [reviewId]
    );
    const review = result.rows[0];

    if (!review) throw new NotFoundError(`No review with ID: ${reviewId}`);

    return review;
  }

  /** Update review data with 'data'
   *
   * Data can include { rating, comment }
   *
   * returns { userId, productId, rating, comment, reviewDate}
   *
   * Throws NotFoundError if user not found or if user set to deleted
   */
  static async update(reviewId, data) {
    const { setCols, values } = createSqlSetClause(data, {
      rating: "rating",
      comment: "comment",
    });

    const sellerVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE reviews
                      SET ${setCols}
                      WHERE review_id = ${sellerVarIdx} AND deleted = FALSE
                      RETURNING user_id AS "userId", 
                                product_id AS "productId",
                                rating,
                                comment,
                                review_date AS "reviewDate"`;

    const result = await db.query(querySql, [...values, reviewId]);
    const review = result.rows[0];

    if (!review) throw new NotFoundError(`No review with ID: ${reviewId}`);

    return review;
  }

  /** Given a reviewId, set review as deleted
   *
   * Throws NotFoundError if user not found or if user set to deleted
   */
  static async remove(reviewId) {
    const review = await this.get(reviewId);

    await db.query(
      `UPDATE reviews
       SET deleted = TRUE
       WHERE review_id = $1`,
      [reviewId]
    );
  }
}

module.exports = Review;
