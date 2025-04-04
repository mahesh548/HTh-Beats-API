const { searchGet } = require("./manageSearch");

const getSearch = async (req, res) => {
  const q = req?.query?.q.toLowerCase().trim();
  const autocomplete = req?.query?.autocomplete;
  const user = req.body.user;
  const page = Math.max(Number(req?.query?.page) || 1, 1);
  if (!q || !autocomplete)
    return res
      .status(400)
      .json({ status: false, msg: "Search query is empty" });

  const data = await searchGet(user.id, q, autocomplete, page);

  res.status(200).json(data);
  try {
  } catch (error) {
    res.send(500).json({ status: false, msg: error.message });
  }
};

module.exports = getSearch;
