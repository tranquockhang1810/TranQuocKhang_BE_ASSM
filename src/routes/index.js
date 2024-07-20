const express = require("express");
const router = express.Router();

router.use("/api/v1/users", require("./users/index"));
router.use("/api/v1/categories", require("./categories/index"));

module.exports = router;
