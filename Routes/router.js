const express = require("express");
//Controllers
const getHome = require("./controller/getHome");
const getPlaylist = require("./controller/getPlaylist");
const router = express.Router();

router.get("/api/home", getHome);
router.get("/api/playlist", getPlaylist);
module.exports = router;
