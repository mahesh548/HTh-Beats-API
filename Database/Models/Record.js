const mongoose = require("mongoose");

const recordSchema = mongoose.Schema({
  query: String,
  ids: [String],
});

module.exports = mongoose.model("record", recordSchema);
