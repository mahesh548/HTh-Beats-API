const Entity = require("../../Database/Models/Entity");
const song = require("../../Database/Models/Song");
const { api } = require("../../utils");
const getSongs = async (ids, userId) => {
  try {
    const data = await song.find({ id: { $in: ids } }).lean();
    const saveIn = await Entity.find({ userId: userId, idList: { $in: ids } }, [
      "idList",
      "id",
    ]).lean();

    data.map((item) => {
      const playThatSaveIt = saveIn
        .filter((playlist) => playlist.idList.includes(item.id))
        .map((playlist) => playlist.id);

      item.savedIn = playThatSaveIt;
      return item;
    });

    return addVideoToSongs(data);
  } catch (error) {
    return { status: "error", msg: error.message };
  }
};

const addSongs = async (list) => {
  try {
    const ids = list.map((item) => item.id);
    const exisitngSongs = await song.find({ id: { $in: ids } });

    const exisitngSongsIds = exisitngSongs.length
      ? exisitngSongs.map((item) => item.id)
      : [];

    const insertingData = list.filter(
      (item) => !exisitngSongsIds.includes(item.id)
    );

    if (insertingData.length) {
      await song.insertMany(insertingData, { runHooks: true });
    }

    return ids;
  } catch (error) {
    console.log(error);
    return error.message;
  }
};

const addVideoToSongs = async (songs) => {
  if (!songs) return songs;
  const nonVideoSongId = []; // stores id of song no video
  const videosPids = {}; // stores video_pids of songId for third party videos
  const videoResult = {}; // stores the video url during process

  const placeholderData = {
    has_video: false,
    video_url: "noVideo",
    video_preview_url: "noVideo",
    video_thumbnail: "noVideo",
  }; // if no video found then this will be dummy data

  songs.forEach((song) => {
    // extracting id of songs with no video
    if (!song?.more_info) return;
    if (nonVideoSongId.indexOf(song?.id) !== -1) return;
    if (
      song.more_info.hasOwnProperty("has_video") ||
      song.more_info.hasOwnProperty("video_url")
    )
      return;

    nonVideoSongId.push(song?.id || "");
  });

  if (nonVideoSongId.length === 0) return songs;

  // getting song data from native api
  try {
    const data = await api(
      `https://www.saavn.com/api.php
?dolby_support=true
&is_apk_compromised=false
&app_version=8.7.1
&network_operator=
&readable_version=8.7.1
&_format=json
&network_subtype=
&state=logout
&cc=
&_marker=0
&ctx=android
&api_version=4
&is_jio_user=true
&__call=song.getDetails
&pids=` + nonVideoSongId.join(",")
    );

    if (!data.status || !data?.data || Object.keys(data?.data).length == 0)
      return songs; // return songs if no data returned
    const shortiesData = data.data;

    nonVideoSongId.forEach((songId) => {
      if (!shortiesData[songId] || !shortiesData[songId]?.more_info) {
        // if native api does not have data about song id then set dummy data
        videoResult[songId] = placeholderData;
        return;
      }
      const data = shortiesData[songId].more_info;

      if (data.hasOwnProperty("shortie") && data.shortie?.media_url) {
        // if shortie is avaialable then set it as video and return
        videoResult[songId] = {
          has_video: true,
          video_url: data.shortie.media_url,
          video_preview_url: data.shortie.media_url,
          video_thumbnail:
            data.shortie?.image || data?.video_thumbnail || "noVideo",
        };
        return;
      }

      if (
        data.hasOwnProperty("video_mappings") &&
        data.video_mappings?.length !== 0
      ) {
        // if shortie is not available then store video_pid to get video details later and return
        videosPids[songId] = data.video_mappings[0];
        return;
      }
      // if there neither shortie nor video_pid then again set dummy data
      videoResult[songId] = placeholderData;
    });
  } catch (error) {
    console.log("error getting videos_pid:", error);
    return songs; // if array in getting song details from native api then return
  }

  // getting video details from native api
  if (Object.keys(videosPids).length > 0) {
    try {
      const data = await api(
        `https://www.saavn.com/api.php
?dolby_support=true
&is_apk_compromised=false
&app_version=8.7.1
&network_operator=
&readable_version=8.7.1
&_format=json
&network_subtype=
&state=logout
&cc=
&_marker=0
&ctx=android
&api_version=4
&is_jio_user=true
&modules=false
&__call=video.getDetailList
&video_pids=` + Object.values(videosPids).join(",")
      );

      if (!data.status || !data?.data || data?.data?.data?.length == 0)
        throw new Error("Videos not found"); // throw error if no data found
      const videoDetails = Object.fromEntries(
        data.data.data.map((video) => [video?.id, video?.more_info])
      ); // create object of video details as value and video id as key

      // insert video url in result object
      Object.keys(videosPids).forEach((songId) => {
        const data = videoDetails[videosPids[songId]];
        if (!data) {
          videoResult[songId] = placeholderData;
          return;
        }
        videoResult[songId] = {
          has_video: true,
          video_url: data?.encrypted_media_url,
          video_preview_url: data?.preview_url,
          video_thumbnail: data?.thumbnail_url || "",
        };
        return;
      });
    } catch (error) {
      console.log(error);
    }
  }

  if (Object.keys(videoResult).length == 0) {
    return songs;
  }

  // create bulk write operation
  const operation = [];
  Object.keys(videoResult).forEach((id) => {
    const data = videoResult[id];
    operation.push({
      updateOne: {
        filter: { id: id },
        update: {
          $set: {
            "more_info.has_video": data.has_video,
            "more_info.video_url": data.video_url,
            "more_info.video_preview_url": data.video_preview_url,
            "more_info.video_thumbnail": data.video_thumbnail,
          },
        },
      },
    });
  });

  try {
    await song.bulkWrite(operation); // update database
    songs.map((s) => {
      if (Object.keys(videoResult).indexOf(s.id) == -1) return s;
      s.more_info = { ...s.more_info, ...videoResult[s.id] };
      return s;
    }); // insert video url inside reponse
  } catch (error) {
    console.log(error);
  }

  return songs;
};

module.exports = { getSongs, addSongs, addVideoToSongs };
