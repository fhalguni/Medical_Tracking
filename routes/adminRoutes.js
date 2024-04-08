const express = require("express");

const fs = require("fs");
const patientController = require("./../controller/patientController");
const authController = require("./../controller/authController");

const router = express.Router();

router.route("/").get(authController.protect, patientController.getAllPatients);

router
  .route("/:id")

  .patch(patientController.updatePatient)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    patientController.deletePatient
  );

module.exports = router;
