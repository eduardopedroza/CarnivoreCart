const jsonschema = require("jsonschema");

const express = require("express");
const router = new express.Router();
const Seller = require("../models/seller");
const { createToken } = require("../helpers/tokens");
const { BadRequestError } = require("../expressError");

const sellerNewSchema = require("../schemas/sellersNewSchema.json");
const sellerUpdateSchema = require("../schemas/sellersUpdateSchema.json");

/** POST /register { seller } => { seller }
 *
 * seller should be { firstName, lastName, username, email, password
 *                  shippingAddress, companyName, contactInfo }
 *
 * Returns { sellerId, companyName, contactInfo }
 *
 * Authorization required: none
 */

router.post("/register", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, sellerNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const seller = await Seller.create(req.body);
    const token = createToken(seller.sellerId);
    return res.status(201).json({ token });
  } catch (e) {
    return next(e);
  }
});

/** GET /[sellerId]  =>  { seller }
 *
 *  Seller is { companyName, contactInfo, rating, salesCount }
 *
 *
 * Authorization required: none
 */
router.get("/:sellerId", async (req, res, next) => {
  try {
    const seller = await Seller.getSellerWithId(req.params.sellerId);
    return res.json({ seller });
  } catch (e) {
    return next(e);
  }
});

/** PATCH /[sellerId] { password, firstName, lastName, email, shippingAddress,
 *                    companyName, contactInfo } => { seller }
 *
 * Patches seller data.
 *
 * Returns {  username, firstName, lastName, email, shippingAddress
 *           companyName, contactInfo, rating, salesCount }
 *
 * Authorization required: none
 */

router.patch("/:sellerId", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, sellerUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const seller = await Seller.update(req.params.sellerId, req.body);
    return res.json({ seller });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[sellerId]/remove
 *
 * Hides seller from application
 *
 * Returns { sellerId, deleted }
 *
 * Authorization required: none
 */

router.patch("/:sellerId/remove", async (req, res, next) => {
  try {
    await Seller.remove(req.params.sellerId);
    return res.json({
      sellerId: req.params.sellerId,
      deleted: true,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
