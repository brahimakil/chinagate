const systemService = require("../services/system.service");

exports.getSettings = async (req, res, next) => {
  try {
    await systemService.getSettings(req, res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    await systemService.updateSettings(req, res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};