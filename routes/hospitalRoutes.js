const express = require("express");

const fs = require("fs");
const hospitalController = require("./../controller/hospitalController");
const authController = require("./../controller/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.protect, hospitalController.getAllHospitals)
  .post(hospitalController.createHospital);

router
  .route("/:id")
  .get(hospitalController.getHospital)
  .patch(hospitalController.updateHospital)
  .delete(hospitalController.deleteHospital);

module.exports = router;
