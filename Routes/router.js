const express = require("express");
//Controllers
const getHome = require("./controller/getHome");
const getEntity = require("./controller/getEntity");
const getArtist = require("./controller/getArtist");
const getSong = require("./controller/getSong");

const router = express.Router();

router.get("/api/home", getHome);
router.get("/api/artist", getArtist);
router.get("/api/song", getSong);
router.get("/api/:entity", getEntity);
module.exports = router;
