const languages = ["Hindi", "English", "Bhojpuri", "Punjabi"];
const smallLanguages = ["hindi", "english", "bhojpuri", "punjabi"];
const axios = require("axios");

const urls = {
  playlist: [
    "https://www.jiosaavn.com/api.php?__call=webapi.get&token=",
    "&type=playlist&p=1&n=50&includeMetaTags=0&ctx=wap6dot0&api_version=4&_format=json&_marker=0",
  ],
  album: [
    "https://www.jiosaavn.com/api.php?__call=webapi.get&token=",
    "&type=album&includeMetaTags=0&ctx=wap6dot0&api_version=4&_format=json&_marker=0",
  ],
  mix: [
    "https://www.jiosaavn.com/api.php?__call=webapi.get&token=",
    "&type=mix&p=1&n=20&includeMetaTags=0&ctx=wap6dot0&api_version=4&_format=json&_marker=0",
  ],
};

//validating language passed by user
const checkLanguage = (langString) => {
  if (!langString) return false;
  const arrayOfLang = langString.split(",");
  if (arrayOfLang.length == 0) return false;

  for (let index = 0; index < arrayOfLang.length; index++) {
    if (languages.indexOf(arrayOfLang[index]) == -1) return false;
  }
  return true;
};
//validating language passed by user
const checkLanguageSmall = (langString) => {
  if (!langString) return false;
  const arrayOfLang = langString.split(",");
  if (arrayOfLang.length == 0) return false;

  for (let index = 0; index < arrayOfLang.length; index++) {
    if (smallLanguages.indexOf(arrayOfLang[index]) == -1) return false;
  }
  return true;
};

//get request
const api = async (url, head = {}) => {
  try {
    const req = await axios.get(url, { headers: head });
    return { status: true, data: req.data };
  } catch (error) {
    return { status: false, msg: error.message };
  }
};

const isNotEmpty = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === "object" && Object.keys(value).length === 0)
    return false;
  return true;
};

const refineObj = (obj) => {
  const arr = Object.keys(obj);
  arr.forEach((ele) => {
    if (!isNotEmpty(obj[ele])) {
      delete obj[ele];
    }
  });
  return obj;
};

const dura = (time) => {
  const now = new Date();
  const old = new Date(time);
  const mili = now - old;
  const sec = Math.floor(mili / 1000);
  const min = Math.floor(sec / 60);
  const hrs = Math.floor(min / 60);
  return { mili, sec, min, hrs };
};
const getEntityUrl = (name, token = "") => {
  if (Object.keys(urls).indexOf(name) == -1) return "";
  return urls[name][0] + token + urls[name][1];
};

const removeObjectId = (array) => {
  if (array.length != 0) {
    array.forEach((item) => delete item?._id);
    return array;
  }
};

const mergeOnIds = (array1, array2) => {
  const ids = array1.map((item) => item.id);
  array2.forEach((item) => {
    if (!ids.includes(item.id)) {
      array1.push(item);
    }
  });
  return array1;
};

const objToArr = (obj) => {
  let array = [];
  for (key in obj) {
    if (obj[key]?.song) {
      array.push(obj[key].song);
    }
  }
  return array;
};

const isAllowed = (userId, id) => {
  // if playlist has no userId array allow access
  if (!Array.isArray(userId)) return true;

  // if userId has no user then allow access
  if (userId.length == 0) return true;

  // if userId array have some user
  if (userId.includes(id)) {
    // if userId contain user
    return true;
  } else {
    // if userId don't contain user
    return false;
  }
};

module.exports = {
  checkLanguage,
  api,
  dura,
  isNotEmpty,
  refineObj,
  getEntityUrl,
  removeObjectId,
  mergeOnIds,
  checkLanguageSmall,
  objToArr,
  isAllowed,
};
