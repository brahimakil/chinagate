const mongoose = require("mongoose");

const systemSchema = new mongoose.Schema(
  {
    whatsappNumber: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const System = mongoose.model("System", systemSchema);
module.exports = System;