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

router.get("/api/home", getHome);
router.get("/api/artist", getArtist);
router.get("/api/song", getSong);
router.get("/api/search", getSearch);
router.get("/api/related", getRelated);
router.get("/api/trending", getTrending);
router.get("/api/queue", getQueue);
router.get("/api/radio", getRadio);
router.get("/api/lyrics", getLyrics);

router.get("/api/entity/:entity", getEntity);
module.exports = router;
