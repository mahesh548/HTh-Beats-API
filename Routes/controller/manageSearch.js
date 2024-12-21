const { api, mergeOnIds } = require("../../utils");
const Song = require("../../Database/Models/Song");
const Search = require("../../Database/Models/Search");
const searchRecord = require("../../Database/Models/Record");

const searchGet = async (q) => {
  try {
    const data = await searchQuery(q);
    return data;
  } catch (error) {
    return error.message;
  }
};

const addSearch = async (list) => {
  try {
    const ids = list.map((item) => item.id);
    const exisitingSearch = await Search.find({ id: { $in: ids } });

    const exisitingSearchIds = exisitingSearch.length
      ? exisitingSearch.map((item) => item.id)
      : [];

    const insertingData = list.filter(
      (item) => !exisitingSearchIds.includes(item.id)
    );

    if (insertingData.length) {
      await Search.insertMany(insertingData, { runHooks: true });
    }
    return ids;
  } catch (error) {
    return error.message;
  }
};

const searchQuery = async (q) => {
  const searching = await searchSearch(q); //searching for Search collection
  const songs = await searchSongs(q); //searching complete songs collection

  const searchData = mergeOnIds(searching, songs); //merging both data
  if (searchData.length >= 15) return searchData; //return data to user if result is enough

  const record = await searchRecord.findQuerySound(q); // if result not enough search if search term is already called to api
  if (record.length != 0) {
    const specificSearch = await Search.find({
      id: { $in: record },
    }); //if already searched by api then get item by their specific id
    return mergeOnIds(searchData, specificSearch); //merging data and sending back
  }
  const data = await api(
    `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${q}`
  );

  if (!data.status) return res.status(500).json({ status: "api error" });
  const apiData = [
    ...data.data?.albums?.data,
    ...data.data?.songs?.data,
    ...data.data?.playlists?.data,
    ...data.data?.artists?.data,
    ...songs,
  ];

  const savedIds = await addSearch(apiData);
  await new searchRecord({ query: q, ids: savedIds }).save(); //saving search term and results ads
  return apiData;
};

const searchSearch = async (q) => {
  try {
    const data = await Search.find(
      {
        $or: [
          { title: { $regex: `\\b${q}`, $options: "i" } },
          { subtitle: { $regex: `\\b${q}`, $options: "i" } },
          { description: { $regex: `\\b${q}`, $options: "i" } },
        ],
      },
      ["title", "subtitle", "type", "image", "url"]
    ).limit(20);

    return data;
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

const searchSongs = async (q) => {
  try {
    const data = await Song.find(
      {
        $or: [
          { title: { $regex: `\\b${q}`, $options: "i" } },
          { subtitle: { $regex: `\\b${q}`, $options: "i" } },
        ],
      },
      ["title", "subtitle", "type", "image", "perma_url"]
    ).limit(5);

    return data;
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

module.exports = { addSearch, searchGet };
