const mongoose = require("mongoose");

class Mongo {
  constructor() {
    this.connect();
  }
  connect() {
    mongoose.connect(process.env.MONGO_URL)
      .then(() => {
        console.log("MongoDB connected");
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = new Mongo();