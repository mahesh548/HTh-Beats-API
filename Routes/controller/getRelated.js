const { api } = require("../../utils");
const Related = require("../../Database/Models/Related");
const Search = require("../../Database/Models/Search");
const Song = require("../../Database/Models/Song");
const { addSongs } = require("./manageSongs");
const { addSearch } = require("./manageSearch");
const getUrl = (type, id, language = "") => {
  const urls = {
    playlist:
      "https://www.jiosaavn.com/api.php?__call=reco.getPlaylistReco&api_version=4&_format=json&_marker=0&ctx=web6dot0&listid=",
    album:
      "https://www.jiosaavn.com/api.php?__call=reco.getAlbumReco&api_version=4&_format=json&_marker=0&ctx=web6dot0&albumid=",
    song: [
      "https://www.jiosaavn.com/api.php?__call=reco.getreco&api_version=4&_format=json&_marker=0&ctx=web6dot0&pid=",
      "&language=",
    ],
  };
  if (Object.keys(urls).indexOf(type) == -1) return "";
  if (type == "song") return urls.song[0] + id + urls.song[1] + language;
  return urls[type] + id;
};
const getRelated = async (req, res) => {
  const id = req?.query?.id;
  const entityType = req?.query?.entity;

  if (getUrl(entityType, id).length == 0 || !id)
    return res
      .status(400)
      .json({ status: false, msg: "Entity id or types are missing!" });
  try {
    const relatedData = await Related.findOne({
      id: id,
      type: entityType,
    });

    if (relatedData) {
      const relatedIds = relatedData.related;
      const responseData =
        entityType == "song"
          ? await Song.find({
              id: { $in: relatedIds },
            })
          : await Search.find({
              id: { $in: relatedIds },
            });
      return res.status(200).json(responseData);
    }
    const data =
      entityType == "song"
        ? await api(getUrl(entityType, id, req.query?.lang))
        : await api(getUrl(entityType, id));

    if (!data.status) return res.status(500).json({ status: "api error" });

    const ids =
      entityType == "song"
        ? await addSongs(data.data)
        : await addSearch(data.data);
    await new Related({ id: id, type: entityType, related: ids }).save();
    res.status(200).json(data.data);
  } catch (error) {
    res.status(500).json({ status: false, msg: error.message });
  }
};
module.exports = getRelated;
