const jsonschema = require("jsonschema");
const express = require("express");
const router = new express.Router();
const Review = require("../models/review");
const { BadRequestError } = require("../expressError");

const reviewNewSchema = require("../schemas/reviewNewSchema.json");
const reviewUpdateSchema = require("../schemas/reviewUpdateSchema.json");

/** POST /create { review } => { review }
 *
 * review should be { userId, productId, rating, comment }
 *
 * Returns { userId, productId, rating, comment }
 *
 * Authorization required: None
 */

router.post("/create", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, reviewNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const review = await Review.create(req.body);
    return res.status(201).json({ review });
  } catch (e) {
    return next(e);
  }
});

/** PATCH /[reviewId]  { comment, rating } => { review }
 *
 * Patches review data
 *
 * Returns { userId, productId, rating, comment, reviewDate }
 *
 * Authorization required: none
 */
router.patch("/:reviewId", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, reviewUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const review = await Review.update(req.params.reviewId, req.body);
    return res.status(201).json({ review });
  } catch (e) {
    return next(e);
  }
});

/** PATCH /[reviewId]/remove  => { reviewId, deleted }
 *
 * Hides review from application
 *
 * Returns { reviewId, deleted }
 *
 * Authorization require: none
 */
router.patch("/:reviewId/remove", async (req, res, next) => {
  try {
    await Review.remove(req.params.reviewId);
    return res.status(201).json({
      reviewId: req.params.reviewId,
      deleted: true,
    });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
