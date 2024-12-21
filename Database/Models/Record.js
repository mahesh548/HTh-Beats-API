const mongoose = require("mongoose");
const soundex = require("soundex");
const recordSchema = mongoose.Schema({
  query: String,
  soundex: [String],
  ids: [String],
});

recordSchema.statics.findQuerySound = async function (q) {
  const soundexCode = q.split(" ").map((item) => soundex(item));
  const data = await this.find({
    $or: [
      { query: { $regex: `\\b${q}`, $options: "i" } },
      { soundex: soundexCode },
    ],
  });
  let specificSearchIds = [];
  if (data.length != 0) {
    data.forEach(
      (element) => (specificSearchIds = [...specificSearchIds, ...element.ids])
    );
    specificSearchIds = [...new Set(specificSearchIds)];
  }
  return specificSearchIds;
};

recordSchema.pre("save", function (next) {
  const soundexCode = this.query.split(" ").map((item) => soundex(item));
  this.soundex = soundexCode;
  next();
});

module.exports = mongoose.model("record", recordSchema);
