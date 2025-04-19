const { api, objToArr, dura } = require("../../utils");
const { addSongs, getSongs } = require("./manageSongs");
const Queue = require("../../Database/Models/Queue");
const getUrl = (type, ids) => {
  const urls = {
    id: [
      "https://www.jiosaavn.com/api.php?__call=webradio.createEntityStation&entity_id=",
      "&entity_type=queue&freemium=&shared=&api_version=4&_format=json&_marker=0&ctx=web5dot0",
    ],

    queue: [
      "https://www.jiosaavn.com/api.php?__call=webradio.getSong&stationid=",
      "&k=50&next=0&api_version=4&_format=json&_marker=0&ctx=web5dot0",
    ],
  };
  return urls[type][0] + JSON.stringify(ids) + urls[type][1];
};
const getQueue = async (req, res) => {
  let entityIds = req.body?.ids;
  const user = req.body.user;

  if (entityIds?.length == 0 || !Array.isArray(entityIds))
    return res
      .status(200)
      .json({ status: false, msg: "Entity IDs are missing!" });
  try {
    const queueFind = await Queue.findOne({ station: entityIds.sort() });
    if (queueFind && dura(queueFind.createdAt).hrs < 160) {
      const respondData = await getSongs(queueFind.ids, user.id);
      return res.status(200).json({ status: true, data: respondData });
    }
    const data = await api(getUrl("id", entityIds));
    if (!data.status)
      return res.status(200).json({ status: false, msg: "api error" });
    if (!data?.data?.stationid)
      return res.status(200).json({ status: false, msg: "api error" });

    const queueData = await api(getUrl("queue", data.data.stationid));
    if (!queueData.status)
      return res.status(200).json({ status: false, msg: "api error" });
    if (queueFind) await Queue.deleteOne({ _id: queueFind._id });
    const arr = objToArr(queueData.data);

    const songIds = await addSongs(arr);
    await new Queue({ station: entityIds.sort(), ids: songIds }).save();

    const responseData = await getSongs(songIds, user.id);

    res.status(200).json({ status: true, data: responseData });
  } catch (error) {
    res.status(500).json({ status: false, msg: error.message });
  }
};
module.exports = getQueue;
