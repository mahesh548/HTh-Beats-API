const home = require("../../Database/Models/Home");
const { api, dura } = require("../../utils");
const getHome = async (req, res) => {
  try {
    const homeData = await home.findOne({ createdAt: { $exists: true } });
    if (homeData && dura(homeData.createdAt).hrs < 24) {
      return res.status(200).json(homeData);
    }

    const data = await api(
      "https://www.jiosaavn.com/api.php?__call=webapi.getLaunchData&api_version=4&_format=json&_marker=0&ctx=web6dot0"
    );

    if (!data.status) return res.status(500).json({ status: "api error" });

    if (homeData) await home.deleteOne({ createdAt: { $exists: true } });
    const newData = await new home({
      data: data.data,
    }).save();

    res.status(200).json(newData);
  } catch (error) {
    res.status(500).json({ status: "api error", msg: error.message });
  }
};

module.exports = getHome;
