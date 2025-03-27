const { api, mergeOnIds, uniqueItemFromArray } = require("../../utils");
const Song = require("../../Database/Models/Song");
const Search = require("../../Database/Models/Search");
const Entity = require("../../Database/Models/Entity");
const Artist = require("../../Database/Models/Artist");
const searchRecord = require("../../Database/Models/Record");

const searchGet = async (q, autocomplete) => {
  try {
    const data = await searchQuery(q, autocomplete);
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

const searchQuery = async (q, autocomplete) => {
  const searching = await searchSearch(q); //searching for Search collection
  const songs = await searchSongs(q); //searching complete songs collection
  const entity = await searchEntity(q); //searching entity collection
  const artist = await searchArtist(q); // searching artist collection

  const searchData = uniqueItemFromArray([searching, songs, entity, artist]); //merging all data

  const record = await searchRecord.findQuerySound(q); // if result not enough search if search term is already called to api

  if (searchData.length >= 20) return { status: true, data: searchData }; //return data to user if result is enough

  if (record.length != 0) {
    //if already searched by api then get item by their specific id
    const specificSearch = await Search.find({
      id: { $in: record },
    });

    const mergedData = uniqueItemFromArray(searchData, specificSearch);
    return { status: true, data: mergedData, record: record }; //merging data and sending back
  }

  if (autocomplete == "true") return { status: true, data: searchData }; // if only autocomplete then don't call api

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
  return { status: true, data: apiData };
};

const searchSearch = async (q) => {
  try {
    const data = await Search.find(
      {
        $or: [
          { title: { $regex: `\\b${q}`, $options: "i" } },
          { subtitle: { $regex: `\\b${q}`, $options: "i" } },
        ],
      },
      ["title", "subtitle", "type", "image", "url", "perma_url", "id"]
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
      ["title", "subtitle", "type", "image", "perma_url", "id"]
    ).limit(10);

    return data;
  } catch (error) {
    console.log(error.message);
    return [];
  }
};
const searchEntity = async (q) => {
  try {
    const data = await Entity.find(
      {
        $and: [
          {
            $or: [
              { title: { $regex: `\\b${q}`, $options: "i" } },
              { subtitle: { $regex: `\\b${q}`, $options: "i" } },
            ],
          },
          {
            $or: [{ userId: { $exists: false } }, { userId: { $size: 0 } }],
          },
        ],
      },
      ["title", "subtitle", "type", "image", "perma_url", "id"]
    ).limit(10);

    return data;
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

const searchArtist = async (q) => {
  try {
    const data = await Artist.find(
      {
        $and: [
          {
            $or: [{ name: { $regex: `\\b${q}`, $options: "i" } }],
          },
        ],
      },
      ["name", "type", "image", "perma_url", "id"]
    ).limit(10);

    return data;
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

module.exports = { addSearch, searchGet };
