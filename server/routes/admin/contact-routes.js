const express = require("express");

  const {
    deleteContact,
    getAllContacts,
  } = require("../../controllers/admin/contact-controller");

  const router = express.Router();


  router.delete("/delete/:id", deleteContact);

  router.get("/get", getAllContacts);

  module.exports = router;