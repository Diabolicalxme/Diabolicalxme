const express = require("express");
const { getBanners } = require("../../controllers/shop/banners-conroller");

const router = express.Router();

router.get("/get", getBanners);

module.exports = router;
