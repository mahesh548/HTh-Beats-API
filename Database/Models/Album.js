const mongoose = require("mongoose");

const albumSchema = mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: String,
  header_desc: String,
  type: { type: String, default: "album" },
  perma_url: String,
  image: { type: String, required: true },
  language: String,
  year: String,
  play_count: String,
  list_count: String,
  idList: { type: [String], required: true },
  list: Array,
  more_info: Object,
  modules: Object,
});

module.exports = mongoose.model("album", albumSchema);
