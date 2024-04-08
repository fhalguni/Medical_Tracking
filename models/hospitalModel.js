const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const hospitalSchema = new mongoose.Schema({
  hospital_name: {
    type: String,
    required: [true, "Please provide your name"],
  },
  patients: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },

  doctors: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
});

const Hospital = mongoose.model("Hospital", hospitalSchema);
module.exports = Hospital;
