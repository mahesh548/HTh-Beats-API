const home = require("../../Database/Models/Home");
const Users = require("../../Database/Models/Users");
const { api, dura } = require("../../utils");
const getHome = async (req, res) => {
  const user = req.body?.user;
  try {
    const usersData = await Users.findOne(
      {
        id: user.id,
      },
      ["languages"]
    ).lean();
    const langString = usersData.languages.sort().join(",");
    const homeData = await home.findOne({
      createdAt: { $exists: true },
      lang: langString,
    });
    if (homeData && dura(homeData.createdAt).hrs < 24) {
      return res.status(200).json(homeData);
    }

    const data = await api(
      "https://www.jiosaavn.com/api.php?__call=webapi.getLaunchData&api_version=4&_format=json&_marker=0&ctx=web6dot0",
      {
        Cookie: `L=${langString};`,
      }
    );

    if (!data.status) return res.status(500).json({ status: "api error" });

    if (homeData)
      await home.deleteOne({ createdAt: { $exists: true }, lang: langString });
    const newData = await new home({
      data: data.data,
      lang: langString,
    }).save();

    res.status(200).json(newData);
  } catch (error) {
    res.status(500).json({ status: "api error", msg: error.message });
  }
};

module.exports = getHome;
