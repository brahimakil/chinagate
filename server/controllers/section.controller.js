/**
 * Title: Section Controller for Dynamic Homepage Management
 * Author: China Gate Team
 * Date: January 2025
 */

const sectionService = require("../services/section.service");

/* add new section */
exports.addSection = async (req, res, next) => {
  try {
    await sectionService.addSection(req, res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};

/* get all sections */
exports.getSections = async (req, res, next) => {
  try {
    await sectionService.getSections(res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};

/* get a section */
exports.getSection = async (req, res, next) => {
  try {
    await sectionService.getSection(req, res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};

/* update section */
exports.updateSection = async (req, res, next) => {
  try {
    await sectionService.updateSection(req, res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};

/* delete section */
exports.deleteSection = async (req, res, next) => {
  try {
    await sectionService.deleteSection(req, res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};

/* reorder sections */
exports.reorderSections = async (req, res, next) => {
  try {
    await sectionService.reorderSections(req, res);
  } catch (error) {
    next(error);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
};
