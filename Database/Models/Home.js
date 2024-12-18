const mongoose = require("mongoose");

const homeSchema = mongoose.Schema({
  language: { type: [String], required: true },
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
  data: Object,
});

homeSchema.pre("save", function (next) {
  /*  console.log(this);
  const arr = Object.keys(this.data);
  arr.forEach((ele) => {
    if (this[ele].length == 0) {
      delete this[ele];
    }
  }); */
  next();
});

module.exports = mongoose.model("home", homeSchema);
