const express = require("express");
  const { createContact } = require("../../controllers/shop/contact-controller");

  const router = express.Router();

  router.post("/add", createContact);

  module.exports = router;