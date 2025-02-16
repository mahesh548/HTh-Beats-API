const Entity = require("../../Database/Models/Entity");
const song = require("../../Database/Models/Song");
const getSongs = async (ids, userId) => {
  try {
    const data = await song.find({ id: { $in: ids } }).lean();
    const saveIn = await Entity.find({ userId: userId, idList: { $in: ids } }, [
      "idList",
      "id",
    ]).lean();

    data.map((item) => {
      const playThatSaveIt = saveIn
        .filter((playlist) => playlist.idList.includes(item.id))
        .map((playlist) => playlist.id);

      item.savedIn = playThatSaveIt;
      return item;
    });

    return data;
  } catch (error) {
    return { status: "error", msg: error.message };
  }
};

const addSongs = async (list) => {
  try {
    const ids = list.map((item) => item.id);
    const exisitngSongs = await song.find({ id: { $in: ids } });

    const exisitngSongsIds = exisitngSongs.length
      ? exisitngSongs.map((item) => item.id)
      : [];

    const insertingData = list.filter(
      (item) => !exisitngSongsIds.includes(item.id)
    );

    if (insertingData.length) {
      await song.insertMany(insertingData, { runHooks: true });
    }

    return ids;
  } catch (error) {
    console.log(error);
    return error.message;
  }
};

module.exports = { getSongs, addSongs };
