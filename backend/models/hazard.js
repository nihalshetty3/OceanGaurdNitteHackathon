const mongoose = require("mongoose");

const hazardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  photo: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Hazard", hazardSchema);
