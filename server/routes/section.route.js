/**
 * Title: Section Route for Dynamic Homepage Management
 * Author: China Gate Team
 * Date: January 2025
 */

const express = require("express");
const sectionController = require("../controllers/section.controller");
const verify = require("../middleware/verify.middleware");
const authorize = require("../middleware/authorize.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

// Public: get all sections
router.get("/get-sections", sectionController.getSections);

// Public: get a section
router.get("/get-section/:id", sectionController.getSection);

// Admin-only: add new section - WITH MULTIPLE FILE UPLOADS
router.post(
  "/add-section",
  verify,
  authorize("admin"),
  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "adImage", maxCount: 1 },
    { name: "designImage", maxCount: 1 },
    { name: "designBackgroundImage", maxCount: 1 }
  ]),
  sectionController.addSection
);

// Admin-only: update section - WITH MULTIPLE FILE UPLOADS
router.patch(
  "/update-section/:id",
  verify,
  authorize("admin"),
  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "adImage", maxCount: 1 },
    { name: "designImage", maxCount: 1 },
    { name: "designBackgroundImage", maxCount: 1 }
  ]),
  sectionController.updateSection
);

// Admin-only: delete section
router.delete(
  "/delete-section/:id",
  verify,
  authorize("admin"),
  sectionController.deleteSection
);

// Admin-only: reorder sections
router.patch(
  "/reorder-sections",
  verify,
  authorize("admin"),
  sectionController.reorderSections
);

module.exports = router;