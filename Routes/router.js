const express = require("express");
//Controllers
const getHome = require("./controller/getHome");

const router = express.Router();

router.get("/api/home", getHome);

module.exports = router;
