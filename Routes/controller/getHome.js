const home = require("../../Database/Models/Home");
const { checkLanguage, api, dura } = require("../../utils");
const getHome = async (req, res) => {
  if (!checkLanguage(req.query.lang))
    return res.status(400).json({ status: "language missing!" });

  const langArray = req.query.lang.split(",").sort();

  try {
    const homeData = await home.findOne({ language: langArray });
    if (homeData && dura(homeData.createdAt).hrs < 24) {
      return res.json(homeData);
    }

    const data = await api(
      "https://www.jiosaavn.com/api.php?__call=webapi.getLaunchData&api_version=4&_format=json&_marker=0&ctx=web6dot0",
      { cookie: `L=${req.query.lang}` }
    );

    if (!data.status) return res.status(500).json({ status: "api error" });

    if (homeData) await home.deleteOne({ _id: homeData._id });
    const newData = await new home({
      language: langArray,
      data: data.data,
    }).save();

    res.json(newData);
  } catch (error) {
    res.status(500).json({ status: "api error", msg: error.message });
  }
};

module.exports = getHome;
