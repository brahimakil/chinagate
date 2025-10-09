const orderService = require("../services/order.service");

exports.createOrder = async (req, res, next) => {
  try {
    await orderService.createOrder(req, res);
  } catch (error) {
    next(error);
  }
};
