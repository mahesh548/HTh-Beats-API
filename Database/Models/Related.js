const mongoose = require("mongoose");

const relatedSchema = mongoose.Schema({
  id: String,
  type: String,
  related: [String],
});

module.exports = mongoose.model("related", relatedSchema);
