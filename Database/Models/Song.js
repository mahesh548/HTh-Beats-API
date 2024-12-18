const mongoose = require("mongoose");

const moreSchema = mongoose.Schema({
  encrypted_drm_media_url: String,
  encrypted_media_url: String,
  lyrics_snippet: String,
  artistMap: Object,
  duration: String,
  album_id: String,
  playlist_id: String,
});

const songSchema = mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: String,
  type: { type: String, default: "song" },
  image: { type: String, required: true },
  language: String,
  year: String,
  more_info: moreSchema,
});

module.exports = mongoose.model("song", songSchema);
