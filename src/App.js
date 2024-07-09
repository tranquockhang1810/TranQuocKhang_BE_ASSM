const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const swagger = require('./helpers/swagger');
const cors = require("cors");

app.use(bodyParser.json());

require('dotenv').config();

//connect to mongodb
require("./dbs/Mongo");

// swagger
swagger(app);

//cors
app.use(cors((req, callback) => {
  callback(null, { origin: true })
}))

module.exports = app;