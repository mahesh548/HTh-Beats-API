const { api, getEntityUrl, isAllowed } = require("../../utils");
const { getSongs, addSongs } = require("./manageSongs");

const Entity = require("../../Database/Models/Entity");
const Library = require("../../Database/Models/Library");
const Users = require("../../Database/Models/Users");
const getEntity = async (req, res) => {
  const id = req?.query?.id;
  const entityType = req?.params?.entity;
  const user = req.body.user;
  if (getEntityUrl(entityType).length == 0 || !id)
    return res
      .status(400)
      .json({ status: false, msg: "Entity id or types are missing!" });
  try {
    const entityData = await Entity.findOne({
      perma_url: id,
    });

    if (entityData) {
      let responseData = entityData.toObject();
      if (!isAllowed(responseData?.userId, user.id)) {
        return res
          .status(405)
          .json({ status: false, msg: "user does not own this playlist!" });
      }
      responseData.isLiked = false;
      //check if user save this playlist
      const likeData = await Library.findOne({
        userId: user.id,
        id: responseData.id,
      });
      if (likeData) {
        responseData.isLiked = true;
      }
      responseData.list = await getSongs(responseData.idList, user.id);
      responseData.list_count = String(responseData.list.length);
      responseData.entityType = checkPlaylistType(responseData, user.id);
      if (
        responseData.entityType == "private" ||
        responseData.entityType == "collab"
      ) {
        const ownerInfo = await Users.find(
          { id: { $in: responseData.userId } },
          { username: 1, pic: 1, _id: 0, id: 1 }
        ).lean();
        responseData.ownerInfo = ownerInfo.map((item) => {
          if (item.id == responseData.owner) {
            item.role = "admin";
          } else {
            item.role = "member";
          }
          return item;
        });
      }
      delete responseData.idList;
      delete responseData._id;
      delete responseData.__v;
      return res.status(200).json(responseData);
    }
    if (id.length == 20)
      return res
        .status(200)
        .json({ status: false, msg: "Playlist is unavailable!", id: id });

    console.log("calling jio saavan api...");
    const data = await api(getEntityUrl(entityType, id));
    console.log("response from jio saavan", data);

    if (!data.status) return res.status(500).json({ status: "api error" });

    const newEntity = await new Entity(data.data);
    newEntity.idList = await addSongs(data.data.list);
    newEntity.perma_url = id;
    newEntity.list = [];
    await newEntity.save();

    data.data.perma_url = id;
    data.data.idList = newEntity.idList;
    data.data.entityType = "entity";

    data.data.list = await getSongs(data.data.idList, user.id);

    return res.status(200).json(data.data);
  } catch (error) {
    console.log("Get Entity Error:", error);
    return res
      .status(200)
      .json({ status: false, msg: "Playlist is unavailable!", error: error });
  }
};
const checkPlaylistType = (response, userId) => {
  if (response?.type == "playlist") {
    if (response.hasOwnProperty("userId") && response.userId.length > 0) {
      if (
        response.userId.includes("viewOnly") &&
        !response.userId.includes(userId)
      )
        return "viewOnly";
      return response.userId.filter((item) => item != "viewOnly").length > 1
        ? "collab"
        : response.userId.length == 1 &&
          response.userId[0] == userId &&
          response.id == userId
        ? "liked"
        : "private";
    }
  }
  return "entity";
};
module.exports = getEntity;
