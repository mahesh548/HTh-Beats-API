const { api, removeObjectId } = require("../../utils");
const Artist = require("../../Database/Models/Artist");
const { getSongs, addSongs } = require("./manageSongs");
const getArtist = async (req, res) => {
  const id = req?.query?.id;
  if (!id)
    return res
      .status(400)
      .json({ status: false, msg: "Artist id is missing!" });

  try {
    const artistData = await Artist.findOne({ perma_url: id });
    if (artistData) {
      console.log("sending cache...");
      let responseData = artistData.toObject();
      responseData.topSongs = await getSongs(responseData.topSongsIds);
      return res.status(200).json(responseData);
    }
    console.log("calling api...");
    const data = await api(
      `https://www.jiosaavn.com/api.php?__call=webapi.get&token=${id}&type=artist&p=&n_song=50&n_album=50&sub_type=&category=&sort_order=&includeMetaTags=0&ctx=web6dot0&api_version=4&_format=json&_marker=0`
    );

    if (!data.status) return res.status(500).json({ status: "api error" });
    if (data.data?.similarArtists?.length != 0) {
      data.data.similarArtists = removeObjectId(data.data.similarArtists);
    }
    const newArtist = await new Artist(data.data);
    if (data.data?.topSongs.length != 0) {
      newArtist.topSongsIds = await addSongs(data.data.topSongs);
      newArtist.topSongs = [];
      data.data.topSongsIds = newArtist.topSongsIds;
    }
    newArtist.perma_url = id;
    await newArtist.save();

    data.data.perma_url = id;

    res.status(200).json(data.data);
  } catch (error) {
    res.status(500).json({ status: false, msg: error.message });
  }
};

module.exports = getArtist;
