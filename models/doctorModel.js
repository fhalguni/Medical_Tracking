const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const doctorSchema = new mongoose.Schema({
  doctor_name: {
    type: String,
    required: [true, "Please provide doctor name"],
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
  },
  specialized_in: {
    type: String,
  },
});

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
