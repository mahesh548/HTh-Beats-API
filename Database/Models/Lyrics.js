const mongoose = require("mongoose");
const lyricsSchema = mongoose.Schema({
  id: String,
  lyrics: String,
});

module.exports = mongoose.model("lyric", lyricsSchema);
