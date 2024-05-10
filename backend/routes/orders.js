const jsonschema = require("jsonschema");
const express = require("express");
const router = new express.Router();
const Order = require("../models/order");
const { BadRequestError } = require("../expressError");

const orderNewSchema = require("../schemas/orderNewSchema.json");
const orderUpdateSchema = require("../schemas/orderUpdateSchema.json");

/** POST /create { order }  => { order }
 *
 * order should be { userId, products, pricePaidInCents }
 *    where products is [ { productId, quantiy, priceInCents } ]
 *
 * Returns { userId, products, pricePaidInCents, status, orderDate }
 *      where products is [ { productId, quantiy, priceInCents } ]
 *
 * Authorization required: none
 */
router.post("/create", async (req, res, next) => {
  try {
    console.log(req.body);
    const validator = jsonschema.validate(req.body, orderNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const order = await Order.create(req.body);
    return res.status(201).json({ order });
  } catch (e) {
    return next(e);
  }
});

/** GET /  => [ { orders } ]
 *
 * Returns [{ userId, products pricePaidInCents, status, orderDate }]
 *      where products is [ { productId, quantiy, priceInCents } ]
 *
 * Authorization required: none
 */
router.get("/", async (req, res, next) => {
  try {
    const orders = await Order.findAll();
    return res.json({ orders });
  } catch (e) {
    return next(e);
  }
});

/** GET /:orderId  => { order }
 *
 * Returns { userId, products pricePaidInCents, status, orderDate }
 *      where products is [ { productId, quantiy, priceInCents } ]
 *
 * Authorization required: none
 */
router.get("/:orderId", async (req, res, next) => {
  try {
    const order = await Order.get(req.params.orderId);
    return res.json({ order });
  } catch (e) {
    return next(e);
  }
});

/** PATCH /:orderId  { products, pricePaidInCents, status }  =>  { order }
 *                  where products is [ { productId, quantiy, priceInCents } ]
 *
 * Patches order data
 *
 * Returns updatedOrder { userId, products pricePaidInCents, status, orderDate }
 *    where products is [ { productId, quantiy, priceInCents } ]
 *
 */
router.patch("/:orderId", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, orderUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const order = await Order.update(req.params.orderId, req.body);
    return res.status(201).json({ order });
  } catch (e) {
    return next(e);
  }
});

/** PATCH /[orderId]/remove
 *
 * Hides order from application
 *
 * Returns { orderId, deleted }
 *
 * Authorization required: none
 */
router.patch("/:orderId/remove", async (req, res, next) => {
  try {
    await Order.remove(req.params.orderId);
    return res.status(201).json({
      orderId: req.params.orderId,
      deleted: true,
    });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
