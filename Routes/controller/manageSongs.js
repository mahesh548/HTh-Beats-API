const song = require("../../Database/Models/Song");
const getPlayListSongs = async (ids) => {
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
    if (exisitngSongs) {
      const exisitngSongsIds = exisitngSongs.map((item) => item.id);
      let insertingData = list.filter(
        (item) => exisitngSongsIds.indexOf(item.id) == -1
      );
      if (insertingData) {
        await song.insertMany(insertingData);
      }
    }
    return ids;
  } catch (error) {
    return error.message;
  }
};

module.exports = { getPlayListSongs, addSongs };
