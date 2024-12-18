const express = require("express");
const router = require("./Routes/router");
const connectDB = require("./Database/connect")();

const app = express();
app.use(router);

app.listen(5000, () => {
  console.log("API listening on port 5000...");
});
