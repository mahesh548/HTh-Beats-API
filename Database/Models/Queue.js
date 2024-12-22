const mongoose = require("mongoose");

const queueSchema = mongoose.Schema({
  station: [String],
  ids: [String],
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
});

module.exports = mongoose.model("queue", queueSchema);
