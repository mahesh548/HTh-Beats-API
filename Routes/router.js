const express = require("express");
//Controllers
const getHome = require("./controller/getHome");
const getEntity = require("./controller/getEntity");
const getArtist = require("./controller/getArtist");
const getSong = require("./controller/getSong");
const getSearch = require("./controller/getSearch");
const getRelated = require("./controller/getRelated");
const getTrending = require("./controller/getTrending");

const router = express.Router();

router.get("/api/home", getHome);
router.get("/api/artist", getArtist);
router.get("/api/song", getSong);
router.get("/api/search", getSearch);
router.get("/api/related", getRelated);
router.get("/api/trending", getTrending);

router.get("/api/entity/:entity", getEntity);
module.exports = router;
