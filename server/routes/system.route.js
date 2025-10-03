const router = require("express").Router();
const systemController = require("../controllers/system.controller");
const verify = require("../middleware/verify.middleware");
const authorize = require("../middleware/authorize.middleware");

// Public: get settings
router.get("/get-settings", systemController.getSettings);

// Admin-only: update settings
router.patch("/update-settings", verify, authorize("admin"), systemController.updateSettings);

module.exports = router;