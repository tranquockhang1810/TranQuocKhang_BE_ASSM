const express = require("express");
const router = express.Router();

router.use("/api/v1/users", require("./users/index"));
router.use("/api/v1/categories", require("./categories/index"));
router.use("/api/v1/products", require("./products/index"));
router.use("/api/v1/transactions", require("./transactions/index"));
router.use("/graphql", require("./graphql/index"));

module.exports = router;
