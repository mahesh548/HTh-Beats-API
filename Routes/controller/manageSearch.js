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
  const [searchingRes, songsRes, entityRes, artistRes] = await Promise.all([
    searchSearch(q, page),
    searchSongs(userId, q, page),
    searchEntity(userId, q, page),
    searchArtist(userId, q, page),
  ]);

  const { data: searching, totalItems: searchTotal } = searchingRes;
  const { data: songs, totalItems: songsTotal } = songsRes;
  const { data: entity, totalItems: entityTotal } = entityRes;
  const { data: artist, totalItems: artistTotal } = artistRes;

  const searchData = uniqueItemFromArray([searching, songs, entity, artist]);

  const hasMore =
    page * 20 < searchTotal ||
    page * 10 < songsTotal ||
    page * 10 < entityTotal ||
    page * 10 < artistTotal;

  if (searchData.length >= 20) {
    return {
      status: true,
      data: searchData,
      hasMore,
      page,
    };
  }

  const record = await searchRecord.findQuerySound(q, page);

  if (record.length !== 0) {
    const { data: specificSearch, totalItems: specificTotal } =
      await queryRecord(record, page);

    const mergedData = uniqueItemFromArray([specificSearch, searchData]);

    const mergedHasMore = page * 10 < specificTotal || hasMore;
    return {
      status: true,
      data: mergedData,
      hasMore: mergedHasMore,
      page,
    };
  }

  if (autocomplete === "true")
    return {
      status: true,
      data: searchData,
    };

  if (page > 1) return { status: true, data: [], hasMore: false, page };

  const data = await api(
    `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${q}`
  );

  if (!data.status) return { status: false, message: "api error" };

  const apiData = [
    ...data.data?.albums?.data,
    ...data.data?.songs?.data,
    ...data.data?.playlists?.data,
    ...data.data?.artists?.data,
    ...songs,
  ];

  const savedIds = await addSearch(apiData);
  await new searchRecord({ query: q, ids: savedIds }).save();

  return { status: true, data: apiData, page: 1, hasMore: false };
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
    return { data, totalItems };
  } catch (error) {
    console.log(error.message);
    return { data: [], totalItems: 0 };
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
      await Song.find(query).select("id").skip(skip).limit(limit).lean()
    ).map((item) => item?.id);

    const totalItems = await Song.countDocuments(query);
    const songs = await getSongs(data, userId);
    return { data: songs, totalItems };
  } catch (error) {
    console.log(error.message);
    return { data: [], totalItems: 0 };
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
    const finalData = await checkEntitySaved(userId, data);
    return { data: finalData, totalItems };
  } catch (error) {
    console.log(error.message);
    return { data: [], totalItems: 0 };
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

    const raw = await Artist.find(query)
      .select("name type image perma_url artistId")
      .skip(skip)
      .limit(limit)
      .lean();

    const data = raw.map((item) => {
      item.id = item.artistId;
      return item;
    });

    const totalItems = await Artist.countDocuments(query);
    const finalData = await checkEntitySaved(userId, data);
    return { data: finalData, totalItems };
  } catch (error) {
    console.log(error.message);
    return { data: [], totalItems: 0 };
  }
};

const queryRecord = async (ids, page) => {
  try {
    const limit = 10;
    const skip = (page - 1) * limit;
    const query = { id: { $in: ids } };

    const data = await Search.find(query).skip(skip).limit(limit).lean();

    const totalItems = await Search.countDocuments(query);

    return { data: data, totalItems };
  } catch (error) {
    console.log(error.message);
    return { data: [], totalItems: 0 };
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
