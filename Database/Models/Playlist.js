const mongoose = require("mongoose");

const playListSchema = mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: String,
  perma_url: String,
  type: { type: String, default: "playlist" },
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

module.exports = mongoose.model("playlist", playListSchema);
