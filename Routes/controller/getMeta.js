const Entity = require("../../Database/Models/Entity");
const Song = require("../../Database/Models/Song");
const Artist = require("../../Database/Models/Artist");

const getMeta = async (req, res) => {
  const id = req?.params?.id;
  const entityType = req?.params?.entity;
  const secret = req?.query?.secret;
  const metaSecret = process.env.META_SECRET;

  if (!entityType || !id || secret !== metaSecret)
    return res
      .status(400)
      .json({ status: false, msg: "No Meta Data Available!" });
  try {
    if (
      entityType == "playlist" ||
      entityType == "album" ||
      entityType == "mix"
    ) {
      const entityData = await Entity.findOne({
        perma_url: id,
      });

      if (entityData) {
        const { title, subtitle, image, header_desc } = entityData.toObject();

        const metaData = {
          status: true,
          title: title,
          subtitle: `${subtitle}, ${header_desc}`,
          image: image.replace("150x150.jpg", "500x500.jpg"),
        };
        return res.status(200).json(metaData);
      }
    }

    if (entityType == "song") {
      const songData = await Song.findOne({ perma_url: id }).lean();
      if (songData) {
        const { title, subtitle, image } = songData;
        const metaData = {
          status: true,
          title: title,
          subtitle: `${subtitle}`,
          image: image.replace("150x150.jpg", "500x500.jpg"),
        };
        return res.status(200).json(metaData);
      }
    }
    if (entityType == "artist") {
      const artistData = await Artist.findOne({ perma_url: id });
      if (artistData) {
        const { name, subtitle, image } = artistData.toObject();
        const metaData = {
          status: true,
          title: name,
          subtitle: `${subtitle}`,
          image: image.replace("150x150.jpg", "500x500.jpg"),
        };
        return res.status(200).json(metaData);
      }
    }
    return res.status(200).json({
      status: true,
      msg: "No Meta Data Available!",
    });
  } catch (error) {
    console.log("Get Entity Error:", error);
    return res
      .status(200)
      .json({ status: false, msg: "No Meta Data Available!", error: error });
  }
};

module.exports = getMeta;
