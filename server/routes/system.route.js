const router = require("express").Router();
const systemController = require("../controllers/system.controller");
const verify = require("../middleware/verify.middleware");
const authorize = require("../middleware/authorize.middleware");
const upload = require("../middleware/upload.middleware");

// Public: get settings
router.get("/get-settings", systemController.getSettings);

// Admin-only: update settings - WITH MULTIPLE FILE UPLOADS
router.patch(
  "/update-settings",
  verify,
  authorize("admin"),
  upload.fields([
    { name: 'homePageImage', maxCount: 1 },
    { name: 'categoriesPageImage', maxCount: 1 },
    { name: 'brandsPageImage', maxCount: 1 },
    { name: 'allProductsPageImage', maxCount: 1 },
  ]),
  systemController.updateSettings
);

module.exports = router;