const Lyrics = require("../../Database/Models/Lyrics");
const { api } = require("../../utils");
const getUrl = (id) => {
  return (
    "https://www.jiosaavn.com/api.php?__call=lyrics.getLyrics&ctx=web6dot0&api_version=4&_format=json&_marker=0&lyrics_id=" +
    id
  );
};
const getLyrics = async (req, res) => {
  const id = req?.query?.id;
  if (!id)
    return res.status(400).json({ status: false, msg: "Song id is missing!" });
  try {
    const lyricsData = await Lyrics.findOne({ id: id });
    if (lyricsData) {
      return res.status(200).json({ status: true, lyrics: lyricsData.lyrics });
    }
    const data = await api(getUrl(id));
    if (!data.status) return res.status(500).json({ status: "api error" });
    if (data.data?.lyrics) {
      await new Lyrics({ id: id, lyrics: data.data?.lyrics }).save();
      return res.status(200).json({ status: true, lyrics: data.data?.lyrics });
    }
    res.status(200).json({});
  } catch (error) {
    res.status(500).json({ status: false, msg: error.message });
  }
};
module.exports = getLyrics;
