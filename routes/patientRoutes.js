const express = require("express");

const fs = require("fs");
const patientController = require("./../controller/patientController");
const authController = require("./../controller/authController");

const router = express.Router();

// router.param("id", patientController.checkId);
router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

router.patch("/updateMe", authController.protect, patientController.updateMe);
router.delete("/deleteMe", authController.protect, patientController.deleteMe);

router
  .route("/")
  .get(authController.protect, patientController.getAllPatients)
  .post(patientController.createNewPatient);

router
  .route("/:id")
  .get(patientController.getPatient)
  .patch(patientController.updatePatient)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    patientController.deletePatient
  );

module.exports = router;
