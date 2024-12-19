const mongoose = require("mongoose");

const moreSchema = mongoose.Schema({
  music: String,
  album_id: String,
  album: String,
  label: String,
  "320kbps": String,
  encrypted_media_url: String,
  encrypted_drm_media_url: String,
  has_lyrics: String,
  lyrics_snippet: String,
  duration: String,
  artistMap: Object,
  release_date: String,
});

const songSchema = mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: String,
  type: { type: String, default: "song" },
  image: { type: String, required: true },
  language: String,
  year: String,
  play_count: String,
  more_info: moreSchema,
  perma_url: String,
});

songSchema.pre("insertMany", async function (next, docs) {
  for (const doc of docs) {
    if (doc?.perma_url?.length != 0) {
      const splitter = doc.perma_url.split("/");
      doc.perma_url = splitter[splitter.length - 1];
    }
  }
  next();
});
module.exports = mongoose.model("song", songSchema);
