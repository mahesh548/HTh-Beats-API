require("dotenv").config();
const express = require("express");
const router = require("./Routes/router");
const auth = require("./Routes/Middlewares/authentication");
const connectDB = require("./Database/connect")();
const bodyParser = require("body-parser");
const cors = require("cors");

//cors setting
const frontendUrl = process.env.FURL;
const corsOptions = {
  origin: frontendUrl,
  methods: ["GET", "POST"],
};

const app = express();

//Middlewares
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());

//authentication middleware
app.use(auth);

//router
app.use(router);

app.listen(5000, () => {
  console.log("API listening on port 5000...");
});
