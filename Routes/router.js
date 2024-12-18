const express = require("express");
//Controllers
const getHome = require("./controller/getHome");
const getPlaylist = require("./controller/getPlaylist");
const getAlbum = require("./controller/getAlbum");
const router = express.Router();

router.get("/api/home", getHome);
router.get("/api/playlist", getPlaylist);
router.get("/api/album", getAlbum);
module.exports = router;
