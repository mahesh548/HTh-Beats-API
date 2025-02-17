const express = require("express");
//Controllers
const getHome = require("./controller/getHome");
const getEntity = require("./controller/getEntity");
const getArtist = require("./controller/getArtist");
const getSong = require("./controller/getSong");
const getSearch = require("./controller/getSearch");
const getRelated = require("./controller/getRelated");
const getTrending = require("./controller/getTrending");
const getQueue = require("./controller/getQueue");
const getRadio = require("./controller/getRadio");
const getLyrics = require("./controller/getLyrics");

const router = express.Router();

// query: "lang" array e.g [Hindi,English]
router.get("/api/home", getHome);

// query: "id" artist id
router.get("/api/artist", getArtist);

// query: "id" song id
router.get("/api/song", getSong);

// query: "q" search term
router.get("/api/search", getSearch);

// query: "entity" playlist,song,album & "id"
router.get("/api/related", getRelated);

// query: "entityType" playlist,album & "lang"
router.get("/api/trending", getTrending);

// query: "entityIds" array of song IDs
router.get("/api/queue", getQueue);

// query: "entity" featured,artist & "name" radio,artist & "lang"
router.get("/api/radio", getRadio);

// query: "id" of song
router.get("/api/lyrics", getLyrics);

// para: "entity" playlist,album,mix & query: "id"
router.get("/api/entity/:entity", getEntity);

module.exports = router;
