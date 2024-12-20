const { searchGet } = require("./manageSearch");

const getSearch = async (req, res) => {
  const q = req?.query?.q.toLowerCase();
  if (!q)
    return res
      .status(400)
      .json({ status: false, msg: "Search query is empty" });

  const data = await searchGet(q);

  res.status(200).json(data);
  try {
  } catch (error) {
    res.send(500).json({ status: false, msg: error.message });
  }
};

module.exports = getSearch;
