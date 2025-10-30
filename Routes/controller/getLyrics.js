const Lyrics = require("../../Database/Models/Lyrics");
const { api } = require("../../utils");
const crypto = require("crypto");

const getUrl = async (id) => {
  const url = `
https://www.saavn.com/api.php
?dolby_support=true
&is_apk_compromised=false
&app_version=8.7.1
&network_operator=
&readable_version=8.7.1
&_format=json
&_marker=0
&ctx=android
&api_version=4
&is_jio_user=true
&modules=false
&__call=lyrics.getLyrics
&lyrics_id=${id}
&lyrics_sig=${getFullSecretKey(id)}
&lyrics_sub=false
 `;

  const { data } = await api(url);
  return data?.subtitles_cdn_uri;
};
const getLyrics = async (req, res) => {
  const id = req?.query?.id;
  if (!id)
    return res.status(400).json({ status: false, msg: "Song id is missing!" });
  try {
    const lyricsData = await Lyrics.findOne({ id: id });
    if (lyricsData) {
      return res.status(200).json({ status: true, lyrics: lyricsData.lyrics });
    }
    const url = await getUrl(id);
    const data = await api(url);
    if (!data.status) return res.status(500).json({ status: "api error" });
    if (data.data?.length > 1) {
      await new Lyrics({ id: id, lyrics: data.data }).save();
      return res.status(200).json({ status: true, lyrics: data.data });
    }
    res.status(200).json({});
  } catch (error) {
    res.status(500).json({ status: false, msg: error.message });
  }
};

function getFullSecretKey(str) {
  try {
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(now.getUTCDate()).padStart(2, "0");
    const formattedDate = `${yyyy}${mm}${dd}`;
    const combined = str + formattedDate + process.env.LYRICS_SECRET;
    const sha1Hash = crypto.createHash("sha1").update(combined).digest("hex");
    const base64Encoded = Buffer.from(sha1Hash, "utf8")
      .toString("base64")
      .replace(/\n/g, "");
    return base64Encoded;
  } catch (err) {
    console.error(err);
    return null;
  }
}

module.exports = getLyrics;
