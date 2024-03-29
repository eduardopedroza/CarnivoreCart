const db = require("../db");
const User = require("./user");
const Seller = require("./seller");
const { createSqlSetClause } = require("../helpers/sql");
const { NotFoundError } = require("../expressError");

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

  /** Find all products
   *
   * Returns [{ sellerId, name, description, priceInCents, meatType, cutType, weightInGrams, imageUrl }]
   */

  static async findAll() {
    const result = await db.query(
      `SELECT seller_id AS "sellerId", 
              name,
              description,
              price_in_cents AS "priceInCents",
              meat_type AS "meatType",
              cut_type AS "cutType",
              weight_in_grams AS "weightInGrams",
              image_url AS "imageUrl"
       FROM products
       WHERE deleted = FALSE`
    );

    return result.rows;
  }

  /** Given a productId, return product
   *
   * Returns { sellerId, name, description, priceInCents, meatType, cutType, weightInGranms, imageUrl }
   *
   * Throws NotFoundError if product not found in database or product has been deleted
   */

  static async get(productId) {
    const result = await db.query(
      `SELECT seller_id AS "sellerId", 
              name,
              description,
              price_in_cents AS "priceInCents",
              meat_type AS "meatType",
              cut_type AS "cutType",
              weight_in_grams AS "weightInGrams",
              image_url AS "imageUrl"
       FROM products
       WHERE product_id = $1 AND deleted = FALSE`,
      [productId]
    );

    const product = result.rows[0];

    if (!product) throw new NotFoundError(`No product with ID: ${productId}`);

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
