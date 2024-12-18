const { api } = require("../../utils");
const { getPlayListSongs, addSongs } = require("./manageSongs");
const Playlist = require("../../Database/Models/Playlist");

const getPlaylist = async (req, res) => {
  const id = req?.query?.id;
  if (!id)
    return res
      .status(400)
      .json({ status: false, msg: "playlist id is missing" });
  try {
    const playListData = await Playlist.findOne({ perma_url: id });
    if (playListData) {
      let responseData = playListData.toObject();
      responseData.list = await getPlayListSongs(responseData.idList);
      return res.status(200).json(responseData);
    }

    const data = await api(
      `https://www.jiosaavn.com/api.php?__call=webapi.get&token=${id}&type=playlist&p=1&n=50&includeMetaTags=0&ctx=web6dot0&api_version=4&_format=json&_marker=0`
    );
    if (!data.status) return res.status(500).json({ status: "api error" });

    const newPlaylist = await new Playlist(data.data);
    newPlaylist.idList = await addSongs(data.data.list);
    newPlaylist.perma_url = id;
    newPlaylist.list = [];
    await newPlaylist.save();

    data.data.perma_url = id;
    data.data.idList = newPlaylist.idList;

    return res.status(200).json(data.data);
  } catch (error) {
    return res.status(500).json({ status: false, msg: error.message });
  }
};
module.exports = getPlaylist;
