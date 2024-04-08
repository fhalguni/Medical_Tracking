const express = require("express");

const fs = require("fs");
const doctorController = require("./../controller/doctorController");
const authController = require("./../controller/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.protect, doctorController.getAllDoctors)
  .post(doctorController.createDoctor);

router
  .route("/:id")
  .get(doctorController.getDoctor)
  .patch(doctorController.updateDoctor)
  .delete(doctorController.deleteDoctor);

module.exports = router;
