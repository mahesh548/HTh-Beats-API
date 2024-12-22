const { api, objToArr, dura } = require("../../utils");
const Song = require("../../Database/Models/Song");
const { addSongs } = require("./manageSongs");
const { addSearch } = require("./manageSearch");
const Queue = require("../../Database/Models/Queue");
const getUrl = (type, para1, para2 = "") => {
  const urls = {
    featured: [
      "https://www.jiosaavn.com/api.php?language=",
      "&mode=&artistid=&api_version=4&_format=json&_marker=0&ctx=wap6dot0&__call=webradio.createFeaturedStation&pid=&query=",
    ],
    artist: [
      "https://www.jiosaavn.com/api.php?language=",
      "&mode=&artistid=&api_version=4&_format=json&_marker=0&ctx=wap6dot0&__call=webradio.createArtistStation&pid=&query=",
    ],

    queue: [
      "https://www.jiosaavn.com/api.php?__call=webradio.getSong&stationid=",
      "&k=50&next=0&api_version=4&_format=json&_marker=0&ctx=web5dot0",
    ],
  };
  if (!Object.keys(urls).includes(type)) return "";
  if (type == "queue") return urls[type][0] + para1 + urls[type][1];
  return urls[type][0] + para1 + urls[type][1] + para2 + "&name=" + para2;
};
const getRadio = async (req, res) => {
  const type = req?.query?.entity;
  const name = req?.query?.name;
  const lang = req?.query?.lang;

  if (getUrl(type, lang, name).length == 0)
    return res
      .status(400)
      .json({ status: false, msg: "Entity IDs are missing!" });
  try {
    const queueFind = await Queue.findOne({
      station: [lang.toLowerCase(), name.toLowerCase()],
    });
    if (queueFind && dura(queueFind.createdAt).hrs < 160) {
      const respondData = await Song.find({ id: { $in: queueFind.ids } });
      return res.status(200).json(respondData);
    }

    const data = await api(getUrl(type, lang, name));
    if (!data.status) return res.status(500).json({ status: "api error" });
    if (!data?.data?.stationid)
      return res.status(500).json({ status: "api error" });

    const queueData = await api(getUrl("queue", data.data.stationid));
    if (!queueData.status) return res.status(500).json({ status: "api error" });
    if (queueFind) await Queue.deleteOne({ _id: queueFind._id });
    const arr = objToArr(queueData.data);

    const songIds = await addSongs(arr);
    await addSearch(arr);
    await new Queue({
      station: [lang.toLowerCase(), name.toLowerCase()],
      ids: songIds,
    }).save();
    res.status(200).json(arr);
  } catch (error) {
    res.status(500).json({ status: false, msg: error.message });
  }
};
module.exports = getRadio;
