const { api } = require("../../utils");
const Song = require("../../Database/Models/Song");
const { addSongs } = require("../controller/manageSongs");
const getSong = async (req, res) => {
  const id = req?.query?.id;
  if (!id)
    return res.status(400).json({ status: false, msg: "Song id is missing!" });
  try {
    const songData = await Song.findOne({ perma_url: id });
    if (songData) return res.status(200).json(songData);
    const data = await api(
      `https://www.jiosaavn.com/api.php?__call=webapi.get&token=${id}&type=song&includeMetaTags=0&ctx=web6dot0&api_version=4&_format=json&_marker=0`
    );
    if (!data.status) return res.status(500).json({ status: "api error" });
    await addSongs(data.data.songs);
    res.status(200).json(data.data);
  } catch (error) {
    res.status(500).json({ status: false, msg: error.message });
  }
};
module.exports = getSong;
