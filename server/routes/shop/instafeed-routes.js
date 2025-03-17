const express = require("express");
const { getInstaFeed } = require("../../controllers/shop/instafeed-controller");

const router = express.Router();

router.get("/get", getInstaFeed);

module.exports = router;
