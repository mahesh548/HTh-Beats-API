const song = require("../../Database/Models/Song");
const getSongs = async (ids) => {
  try {
    const data = await song.find({ id: { $in: ids } });
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
    return error.message;
  }
};

module.exports = { getSongs, addSongs };
