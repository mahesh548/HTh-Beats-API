const mongoose = require("mongoose");

const objSchema = mongoose.Schema({
  id: String,
  image: String,
  perma_url: String,
  subtitle: String,
  title: String,
  type: String,
  language: String,
  year: String,
  play_count: String,
});

const artSchema = mongoose.Schema({
  dominantType: String,
  id: String,
  image_url: String,
  languages: String,
  name: String,
  perma_url: String,
  roles: String,
  twitter: String,
  type: String,
});
const artistSchema = mongoose.Schema({
  artistId: String,
  availableLanguages: [String],
  bio: String,
  dedicated_artist_playlist: [objSchema],
  dob: String,
  dominantLanguage: String,
  dominantType: String,
  fan_count: String,
  fb: String,
  featured_artist_playlist: [objSchema],
  follower_count: String,
  image: String,
  isRadioPresent: String,
  isVerified: String,
  is_followed: String,
  latest_release: [objSchema],
  name: String,
  similarArtists: [artSchema],
  singles: [objSchema],
  subtitle: String,
  topAlbums: [objSchema],
  topSongs: Array,
  topSongsIds: Array,
  twitter: String,
  type: String,
  wiki: String,
  perma_url: String,
});

module.exports = mongoose.model("artist", artistSchema);
