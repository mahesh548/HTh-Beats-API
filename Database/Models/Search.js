const mongoose = require("mongoose");

const searchSchema = mongoose.Schema({
  title: String,
  subtitle: String,
  url: String,
  perma_url: String,
  image: String,
  type: String,
  description: String,
  id: String,
});

searchSchema.pre("insertMany", async function (next, docs) {
  for (const doc of docs) {
    if (doc?.url?.length) {
      const splitter = doc.url.split("/");
      doc.url = splitter[splitter.length - 1];
    }
    if (doc?.perma_url?.length) {
      const splitter = doc.perma_url.split("/");
      doc.perma_url = splitter[splitter.length - 1];
    }
  }
  next();
});

module.exports = mongoose.model("search", searchSchema);
