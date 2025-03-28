const { api, uniqueItemFromArray } = require("../../utils");
const Song = require("../../Database/Models/Song");
const Search = require("../../Database/Models/Search");
const Entity = require("../../Database/Models/Entity");
const Artist = require("../../Database/Models/Artist");
const searchRecord = require("../../Database/Models/Record");
const Library = require("../../Database/Models/Library");
const { getSongs } = require("./manageSongs");

const searchGet = async (userId, q, autocomplete) => {
  try {
    const data = await searchQuery(userId, q, autocomplete);
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

const searchQuery = async (userId, q, autocomplete) => {
  const searching = await searchSearch(q); //searching for Search collection
  const songs = await searchSongs(userId, q); //searching complete songs collection
  const entity = await searchEntity(userId, q); //searching entity collection
  const artist = await searchArtist(userId, q); // searching artist collection

  const searchData = uniqueItemFromArray([searching, songs, entity, artist]); //merging all data

  const record = await searchRecord.findQuerySound(q); // if result not enough search if search term is already called to api

  if (searchData.length >= 20) return { status: true, data: searchData }; //return data to user if result is enough

  if (record.length != 0) {
    //if already searched by api then get item by their specific id
    const specificSearch = await Search.find({
      id: { $in: record },
    });

    const mergedData = uniqueItemFromArray(specificSearch, searchData);
    return { status: true, data: mergedData }; //merging data and sending back
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

const searchSongs = async (userId, q) => {
  try {
    const data = (
      await Song.find(
        {
          $or: [
            { title: { $regex: `\\b${q}`, $options: "i" } },
            { subtitle: { $regex: `\\b${q}`, $options: "i" } },
          ],
        },
        ["id"]
      )
        .limit(10)
        .lean()
    ).map((item) => item?.id);

    return await getSongs(data, userId);
  } catch (error) {
    console.log(error.message);
    return [];
  }
};
const searchEntity = async (userId, q) => {
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
    )
      .limit(10)
      .lean();

    return await checkEntitySaved(userId, data);
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

const searchArtist = async (userId, q) => {
  try {
    const data = (
      await Artist.find(
        {
          $and: [
            {
              $or: [{ name: { $regex: `\\b${q}`, $options: "i" } }],
            },
          ],
        },
        ["name", "type", "image", "perma_url", "artistId"]
      )
        .limit(10)
        .lean()
    ).map((item) => {
      item.id = item.artistId;
      return item;
    });

    return await checkEntitySaved(userId, data);
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

const checkEntitySaved = async (userId, data) => {
  //return if there is no data
  if (data?.length == 0) return [];

  //map only id/artistId
  const ids = data.map((item) => item?.id);
  //search for library with userId and id
  const savedEntity = (
    await Library.find({ id: { $in: ids }, userId: userId }, ["id"]).lean()
  ).map((item) => item?.id);

  let finalData = data.map((item) => {
    item.isLiked = false;
    //if user saved it in library set it to true
    if (savedEntity.includes(item.id)) item.isLiked = true;
    return item;
  });
  return finalData;
};

module.exports = { addSearch, searchGet };
