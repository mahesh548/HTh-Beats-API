const { api, getEntityUrl, isAllowed } = require("../../utils");
const { getSongs, addSongs } = require("./manageSongs");

const Entity = require("../../Database/Models/Entity");

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

      responseData.list = await getSongs(responseData.idList);
      responseData.list_count = String(responseData.list.length);
      delete responseData.userId;
      delete responseData.idList;
      delete responseData._id;
      delete responseData.__v;
      return res.status(200).json(responseData);
    }

    const data = await api(getEntityUrl(entityType, id));

    if (!data.status) return res.status(500).json({ status: "api error" });

    const newEntity = await new Entity(data.data);
    newEntity.idList = await addSongs(data.data.list);
    newEntity.perma_url = id;
    newEntity.list = [];
    await newEntity.save();

    data.data.perma_url = id;
    data.data.idList = newEntity.idList;

    return res.status(200).json(data.data);
  } catch (error) {
    return res.status(500).json({ status: false, msg: error.message });
  }
};
module.exports = getEntity;
