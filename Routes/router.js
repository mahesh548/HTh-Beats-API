const express = require("express");
const getHome = require("./controller/getHome");
const router = express.Router();

router.get("/", getHome);

module.exports = router;
