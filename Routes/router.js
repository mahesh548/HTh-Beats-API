const express = require("express");
//Controllers
const getHome = require("./controller/getHome");
const getEntity = require("./controller/getEntity");

const router = express.Router();

router.get("/api/home", getHome);
router.get("/api/:entity", getEntity);
module.exports = router;
