const System = require("../models/system.model");

/* get system settings */
exports.getSettings = async (req, res) => {
  let settings = await System.findOne();
  if (!settings) {
    settings = await System.create({ whatsappNumber: "" });
  }

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "System settings fetched successfully",
    data: settings,
  });
};

/* update system settings */
exports.updateSettings = async (req, res) => {
  const { whatsappNumber } = req.body;

  const updated = await System.findOneAndUpdate(
    {},
    { whatsappNumber: whatsappNumber || "" },
    { new: true, upsert: true }
  );

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "System settings updated successfully",
    data: updated,
  });
};