const { getEntityUrl } = require("../../utils");

const Entity = require("../../Database/Models/Entity");
const Song = require("../../Database/Models/Song");
const Artist = require("../../Database/Models/Artist");

const getMeta = async (req, res) => {
  const id = req?.params?.id;
  const entityType = req?.params?.entity;
  const secret = req?.query?.secret;
  const metaSecret = process.env.META_SECRET;

  if (getEntityUrl(entityType).length == 0 || !id || secret !== metaSecret)
    return res
      .status(400)
      .json({ status: false, msg: "Entity id or types are missing!" });
  try {
    if (entityType != "song" && entityType != "artist") {
      const entityData = await Entity.findOne({
        perma_url: id,
      });

      if (entityData) {
        const { title, subtitle, image, header_desc } = entityData.toObject();

        const metaData = {
          status: true,
          title: title,
          subtite: `${subtitle}, ${header_desc}`,
          image: image,
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
          subtite: `${subtitle}`,
          image: image,
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
          subtite: `${subtitle}`,
          image: image,
        };
        return res.status(200).json(metaData);
      }
    }
  } catch (error) {
    console.log("Get Entity Error:", error);
    return res
      .status(200)
      .json({ status: false, msg: "Playlist is unavailable!", error: error });
  }
};

module.exports = getMeta;
