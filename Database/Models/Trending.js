const mongoose = require("mongoose");

const trendSchema = mongoose.Schema({
  lang: String,
  type: String,
  trend: [String],
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
});

module.exports = mongoose.model("trending", trendSchema);
