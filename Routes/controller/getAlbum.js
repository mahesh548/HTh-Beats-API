const { api } = require("../../utils");
const { getSongs, addSongs } = require("./manageSongs");
const Album = require("../../Database/Models/Album");

const getAlbum = async (req, res) => {
  const id = req?.query?.id;
  if (!id)
    return res.status(400).json({ status: false, msg: "album id is missing" });
  try {
    const albumData = await Album.findOne({ perma_url: id });
    if (albumData) {
      let responseData = albumData.toObject();
      responseData.list = await getSongs(responseData.idList);
      return res.status(200).json(responseData);
    }

    const data = await api(
      `https://www.jiosaavn.com/api.php?__call=webapi.get&token=${id}&type=album&includeMetaTags=0&ctx=wap6dot0&api_version=4&_format=json&_marker=0`
    );
    if (!data.status) return res.status(500).json({ status: "api error" });

    const newAlbum = await new Album(data.data);
    newAlbum.idList = await addSongs(data.data.list);
    newAlbum.perma_url = id;
    newAlbum.list = [];
    await newAlbum.save();

    data.data.perma_url = id;
    data.data.idList = newAlbum.idList;

    return res.status(200).json(data.data);
  } catch (error) {
    return res.status(500).json({ status: false, msg: error.message });
  }
};
module.exports = getAlbum;
