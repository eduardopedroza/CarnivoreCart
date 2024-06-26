const db = require("../db");
const User = require("./user");
const Seller = require("./seller");
const { createSqlSetClause } = require("../helpers/sql");
const { NotFoundError, BadRequestError } = require("../expressError");

class Product {
  /** Create product
   *
   * data should be { sellerId, name, description, priceInCents, meatType, cutType, weightInGrams, imageUrl }
   *
   * Returns { sellerId, name, description, priceInCents, meatType, cutType, weightInGrams, imageUrl }
   *
   * Throws NotFoundError if seller not found in database
   */

  static async create({
    sellerId,
    name,
    description,
    priceInCents,
    meatType,
    cutType,
    weightInGrams,
    imageUrl,
  }) {
    const seller = await Seller.getSellerWithId(sellerId);

    const productResult = await db.query(
      `INSERT INTO products(seller_id, name, description, price_in_cents, meat_type, cut_type, weight_in_grams, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING product_id AS "productId",
                 seller_id AS "sellerId", 
                 name,
                 description,
                 price_in_cents AS "priceInCents",
                 meat_type AS "meatType",
                 cut_type AS "cutType",
                 weight_in_grams AS "weightInGrams",
                 image_url AS "imageUrl"`,
      [
        sellerId,
        name,
        description,
        priceInCents,
        meatType,
        cutType,
        weightInGrams,
        imageUrl,
      ]
    );

    const product = productResult.rows[0];

    return product;
  }

  /** Find all products (optional filter on searchFilters)
   *
   * searchFilters (all optional):
   * - sellerId
   * - name (will find case-insensitive, partial matches)
   * - meatType (will find case-insensitive, partial matches)
   * - cutType (will find case-insensitive, partial matches)
   * - minPrice
   * - maxPrice
   *
   * Returns [{ productId, sellerId, name, description, priceInCents,
   *          meatType, cutType, weightInGrams, imageUrl, averageRating, totalReviews}]
   */

  static async findAll(searchFilters = {}) {
    let query = `SELECT p.product_id AS "productId",
                        p.seller_id AS "sellerId", 
                        p.name,
                        p.description,
                        p.price_in_cents AS "priceInCents",
                        p.meat_type AS "meatType",
                        p.cut_type AS "cutType",
                        p.weight_in_grams AS "weightInGrams",
                        p.image_url AS "imageUrl",
                        COALESCE(r.total_reviews, 0) AS "totalReviews",
                        COALESCE(r.average_rating, 0) AS "averageRating"
                 FROM products p
                 LEFT JOIN (
                     SELECT product_id, 
                            COUNT(*) AS total_reviews,
                            AVG(rating) AS average_rating
                     FROM reviews
                     WHERE deleted = FALSE
                     GROUP BY product_id
                 ) r ON p.product_id = r.product_id`;

    let whereExpressions = [];
    let queryValues = [];

    const { sellerId, name, meatType, cutType, minPrice, maxPrice } =
      searchFilters;

    if (minPrice > maxPrice) {
      throw new BadRequestError("Min price cannot be greater than max price");
    }

    if (sellerId) {
      queryValues.push(sellerId);
      whereExpressions.push(`p.seller_id = $${queryValues.length}`);
    }

    if (name) {
      queryValues.push(`%${name}%`);
      whereExpressions.push(`p.name ILIKE $${queryValues.length}`);
    }

    if (meatType) {
      queryValues.push(`%${meatType}%`);
      whereExpressions.push(`p.meat_type ILIKE $${queryValues.length}`);
    }

    if (cutType) {
      queryValues.push(`%${cutType}%`);
      whereExpressions.push(`p.cut_type ILIKE $${queryValues.length}`);
    }

    if (minPrice !== undefined) {
      queryValues.push(minPrice);
      whereExpressions.push(`p.price_in_cents >= $${queryValues.length}`);
    }

    if (maxPrice !== undefined) {
      queryValues.push(maxPrice);
      whereExpressions.push(`p.price_in_cents <= $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    } else {
      query += " WHERE 1=1";
    }
    query += " AND p.deleted = FALSE";

    const result = await db.query(query, queryValues);
    return result.rows;
  }

  /** Given a productId, return { product, reviews }
   *
   *  Returns { sellerId, name, description, priceInCents, meatType, cutType, weightInGrams, imageUrl, reviews: [] }
   *
   *  Throws NotFoundError if product not found in database or product has been deleted
   */
  static async get(productId) {
    const result = await db.query(
      `SELECT p.product_id AS "productId",
            p.seller_id AS "sellerId", 
            p.name,
            p.description,
            p.price_in_cents AS "priceInCents",
            p.meat_type AS "meatType",
            p.cut_type AS "cutType",
            p.weight_in_grams AS "weightInGrams",
            p.image_url AS "imageUrl",
            r.review_id AS "reviewId",
            r.user_id AS "userId",
            r.rating,
            r.comment,
            r.review_date AS "reviewDate"
     FROM products p
     LEFT JOIN reviews r ON p.product_id = r.product_id
     WHERE p.product_id = $1 AND p.deleted = FALSE`,
      [productId]
    );

    const product = result.rows[0];

    if (!product) throw new NotFoundError(`No product with ID: ${productId}`);

    const reviews = result.rows
      .filter((row) => row.reviewId)
      .map((row) => ({
        reviewId: row.reviewId,
        userId: row.userId,
        rating: row.rating,
        comment: row.comment,
        reviewDate: row.reviewDate,
      }));

    delete product.reviewId;
    delete product.userId;
    delete product.rating;
    delete product.comment;
    delete product.reviewDate;

    product.reviews = reviews;

    return product;
  }

  /** Given a product name and sellerId, return product
   *
   * Returns { sellerId, name, description, priceInCents, meatType, cutType, weightInGrams, imageUrl }
   *
   * Throws NotFoundError if product not found in database or if product has been deleted
   */
  static async getProductId(name, sellerId) {
    const result = await db.query(
      `SELECT product_id AS "productId"
       FROM products
       WHERE name = $1 AND seller_id = $2 AND deleted = FALSE`,
      [name, sellerId]
    );

    const productId = result.rows[0].productId;

    if (!productId)
      throw new NotFoundError(
        `No product found with name: ${name} and sellerId: ${sellerId}`
      );

    return productId;
  }

  /** Update product data with 'data'
   *
   * Data can include { description, priceInCents, weight, imageUrl }
   *
   * Returns { sellerId, name, description, priceInCents, meatType, cutType, weightInGrams, imageUrl }
   *
   * Throws NotFoundError if product not found or if product has been deleted
   */
  static async update(productId, data) {
    const { setCols, values } = createSqlSetClause(data, {
      priceInCents: "price_in_cents",
      weightInGrams: "weight_in_grams",
      imageUrl: "image_url",
    });

    const sellerVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE products
                      SET ${setCols}
                      WHERE product_id = ${sellerVarIdx} AND deleted = FALSE
                      RETURNING seller_id AS "sellerId", 
                                name,
                                description,
                                price_in_cents AS "priceInCents",
                                meat_type AS "meatType",
                                cut_type AS "cutType",
                                weight_in_grams AS "weightInGrams",
                                image_url AS "imageUrl"`;

    const result = await db.query(querySql, [...values, productId]);
    const product = result.rows[0];

    if (!product) {
      throw new NotFoundError(`No product found with ID: ${productId}`);
    }

    return product;
  }

  /** Set given producy as deleted, returns undefined
   *
   * Finds product from database
   *
   * Throws NotFoundError if product not found
   *
   * Sets product as deleted
   */

  static async remove(productId) {
    const product = await this.get(productId);

    await db.query(
      `UPDATE products
       SET deleted = TRUE
       WHERE product_id = $1`,
      [productId]
    );
  }
}

module.exports = Product;
