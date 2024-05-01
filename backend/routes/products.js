const jsonschema = require("jsonschema");
const express = require("express");
const router = new express.Router();
const Product = require("../models/product");
const Review = require("../models/review");
const { BadRequestError } = require("../expressError");

const productNewSchema = require("../schemas/productNewSchema.json");
const productUpdateSchema = require("../schemas/productUpdateSchema.json");
const productSearchSchema = require("../schemas/productSearchSchema.json");
/** POST /create { product } => { product }
 *
 * product should be { sellerId, name , description, priceInCents,
 *                     meatType, cutType, weightInGrams, imageUrl }
 *
 * returns { sellerId, name , description, priceInCents,
 *           meatType, cutType, weightInGrams, imageUrl  }
 *
 * Authorization required: none
 */
router.post("/create", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, productNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const product = await Product.create(req.body);
    return res.status(201).json({ product });
  } catch (e) {
    return next(e);
  }
});

/** GET /  =>  [ { products } ]
 *
 * Gets all products
 *
 * Product is { productId, sellerId, name , description, priceInCents,
 *           meatType, cutType, weightInGrams, imageUrl, averageRating, totalReviews }
 *
 * Can filter on provided search filters:
 * - sellerId
 * - name (will find case-insensitive, partial matches)
 * - meatType (will find case-insensitive, partial matches)
 * - cutType (will find case-insensitive, partial matches)
 * - minPrice
 * - maxPrice
 *
 * Authorization required: none
 */
router.get("/", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.query, productSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const products = await Product.findAll(req.query);
    return res.json({ products });
  } catch (e) {
    return next(e);
  }
});

/** GET /[productId]  =>  { product }
 *
 * Product is { sellerId, name , description, priceInCents,
 *           meatType, cutType, weightInGrams, imageUrl, reviews: [] }
 *
 * Reviews is [ { reviewId, userId, productId, rating, comment, reviewDate } ]
 *
 * Authorization required: none
 */
router.get("/:productId", async (req, res, next) => {
  try {
    const product = await Product.get(req.params.productId);
    return res.json({ product });
  } catch (e) {
    return next(e);
  }
});

// /** GET /[producId]/review/[reviewId]  =>  { review }
//  *
//  * Gets specific review from a product
//  *
//  * Review is { reviewId, userId, productId, rating, comment, reviewDate }
//  *
//  * Authorization required: none
//  */
// router.get("/:productId/reviews/:reviewId", async (req, res, next) => {
//   try {
//     const review = await Review.get(req.params.reviewId);
//     return res.json({ review });
//   } catch (e) {
//     return next(e);
//   }
// });

/** PATCH /[productId] { description, priceInCents, weight, imageUrl }  =>  { product }
 *
 * Patches product data
 *
 * Returns { sellerId, name , description, priceInCents,
 *           meatType, cutType, weightInGrams, imageUrl }
 *
 * Authorization required: none
 */
router.patch("/:productId", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, productUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const product = await Product.update(req.params.productId, req.body);
    return res.status(201).json({ product });
  } catch (e) {
    return next(e);
  }
});

/** PATCH /[productId]/remove
 *
 * Hides product from application
 *
 * Returns { productId, deleted}
 *
 * Authorization required: none
 */
router.patch("/:productId/remove", async (req, res, next) => {
  try {
    await Product.remove(req.params.productId);
    return res.status(201).json({
      productId: req.params.productId,
      deleted: true,
    });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
