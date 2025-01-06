const express = require("express");
const router = require("./Routes/router");
const auth = require("./Routes/Middlewares/authentication");
const connectDB = require("./Database/connect")();

const app = express();
app.use(router);
app.use(auth);
app.use(express.json());
app.listen(5000, () => {
  console.log("API listening on port 5000...");
});
