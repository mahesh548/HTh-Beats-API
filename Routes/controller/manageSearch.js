const { api, uniqueItemFromArray } = require("../../utils");
const Song = require("../../Database/Models/Song");
const Search = require("../../Database/Models/Search");
const Entity = require("../../Database/Models/Entity");
const Artist = require("../../Database/Models/Artist");
const searchRecord = require("../../Database/Models/Record");
const Library = require("../../Database/Models/Library");
const { getSongs } = require("./manageSongs");

let totalResult = 0;

const searchGet = async (userId, q, autocomplete, page) => {
  try {
    const data = await searchQuery(userId, q, autocomplete, page);
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

const searchQuery = async (userId, q, autocomplete, page) => {
  const searching = await searchSearch(q, page); //searching for Search collection
  const songs = await searchSongs(userId, q, page); //searching complete songs collection
  const entity = await searchEntity(userId, q, page); //searching entity collection
  const artist = await searchArtist(userId, q, page); // searching artist collection

  const searchData = uniqueItemFromArray([searching, songs, entity, artist]); //merging all data

  const record = await searchRecord.findQuerySound(q); // if result not enough search if search term is already called to api

  if (searchData.length >= 20)
    return {
      status: true,
      data: searchData,
      hasMore: searchData.length < totalResult,
      page: page,
    }; //return data to user if result is enough

  if (record.length != 0) {
    //if already searched by api then get item by their specific id
    const specificSearch = await Search.find({
      id: { $in: record },
    });
    const prevLength = searchData.length;
    const mergedData = uniqueItemFromArray([specificSearch, searchData]);
    totalResult = totalResult + (mergedData.length - prevLength);
    return {
      status: true,
      data: mergedData,
      hasMore: mergedData.length < totalResult,
      page: page,
    }; //merging data and sending back
  }

  if (autocomplete == "true")
    return {
      status: true,
      data: searchData,
    }; // if only autocomplete then don't call api

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

const searchSearch = async (q, page) => {
  try {
    const limit = 20;
    const skip = (page - 1) * limit;
    const query = {
      $or: [
        { title: { $regex: `\\b${q}`, $options: "i" } },
        { subtitle: { $regex: `\\b${q}`, $options: "i" } },
      ],
    };
    const data = await Search.find(query)
      .select("title subtitle type image url perma_url id")
      .skip(skip)
      .limit(limit);

    const totalItems = await Search.countDocuments(query);
    totalResult = totalResult + totalItems;

    return data;
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

const searchSongs = async (userId, q, page) => {
  try {
    const limit = 10;
    const skip = (page - 1) * limit;
    const query = {
      $or: [
        { title: { $regex: `\\b${q}`, $options: "i" } },
        { subtitle: { $regex: `\\b${q}`, $options: "i" } },
      ],
    };

    const data = (
      await Song.find(query).select("id").skip(skip).limit(10).lean()
    ).map((item) => item?.id);

    const totalItems = await Song.countDocuments(query);
    totalResult = totalResult + totalItems;

    return await getSongs(data, userId);
  } catch (error) {
    console.log(error.message);
    return [];
  }
};
const searchEntity = async (userId, q, page) => {
  try {
    const limit = 10;
    const skip = (page - 1) * limit;
    const query = {
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
    };
    const data = await Entity.find(query)
      .select("title subtitle type image perma_url id")
      .skip(skip)
      .limit(limit)
      .lean();

    const totalItems = await Entity.countDocuments(query);
    totalResult = totalResult + totalItems;

    return await checkEntitySaved(userId, data);
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

const searchArtist = async (userId, q, page) => {
  try {
    const limit = 10;
    const skip = (page - 1) * limit;
    const query = {
      $and: [
        {
          $or: [{ name: { $regex: `\\b${q}`, $options: "i" } }],
        },
      ],
    };

    const data = (
      await Artist.find(query)
        .select("name type image perma_url artistId")
        .skip(skip)
        .limit(10)
        .lean()
    ).map((item) => {
      item.id = item.artistId;
      return item;
    });

    const totalItems = await Artist.countDocuments(query);
    totalResult = totalResult + totalItems;

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
