const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost/cache");
    console.log("Cache database connected..");
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = connectDB;
