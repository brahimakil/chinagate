const router = require("express").Router();
const orderController = require("../controllers/order.controller");
const verify = require("../middleware/verify.middleware");

// Create order (Cash on Delivery)
router.post("/create-order", verify, orderController.createOrder);

module.exports = router;
