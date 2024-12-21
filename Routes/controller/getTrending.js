const { api, checkLanguageSmall, dura } = require("../../utils");
const Trending = require("../../Database/Models/Trending");
const Search = require("../../Database/Models/Search");

const { addSearch } = require("./manageSearch");
const getUrl = (type, language) => {
  const urls = {
    playlist:
      "https://www.jiosaavn.com/api.php?__call=content.getTrending&api_version=4&_format=json&_marker=0&ctx=wap6dot0&entity_type=playlist&entity_language=",

    album:
      "https://www.jiosaavn.com/api.php?__call=content.getTrending&api_version=4&_format=json&_marker=0&ctx=wap6dot0&entity_type=album&entity_language=",
  };
  if (Object.keys(urls).indexOf(type) == -1) return "";
  return urls[type] + language;
};
const getTrending = async (req, res) => {
  const lang = req?.query?.lang;
  const entityType = req?.query?.entity;

  if (getUrl(entityType, lang).length == 0 || !checkLanguageSmall(lang))
    return res
      .status(400)
      .json({ status: false, msg: "Entity Languages or types are missing!" });
  try {
    const trendData = await Trending.findOne({
      lang: lang,
      type: entityType,
    });

    if (trendData && dura(trendData.createdAt).hrs < 160) {
      const trendIds = trendData.trend;
      const responseData = await Search.find({
        id: { $in: trendIds },
      });
      return res.status(200).json(responseData);
    }
    const data = await api(getUrl(entityType, lang));

    if (!data.status) return res.status(500).json({ status: "api error" });
    if (trendData) await Trending.deleteOne({ _id: trendData._id });
    const ids = await addSearch(data.data);
    await new Trending({ lang: lang, type: entityType, trend: ids }).save();
    res.status(200).json(data.data);
  } catch (error) {
    res.status(500).json({ status: false, msg: error.message });
  }
};
module.exports = getTrending;
