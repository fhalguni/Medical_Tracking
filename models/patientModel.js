const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    trim: true,
    required: [true, "A patient must have a name"],
    maxlength: [
      40,
      "A patient name must have less than or equal to 40 characters",
    ],
    minlength: [1, "A patient name must have  more than 10 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Invalid Email"],
  },
  username: {
    type: String,
    required: [true, "Please provide your username"],
    unique: true,
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, "User must enter the password"],
    minLength: 8,

    //Validator will only work on save and create query
    validate: {
      validator: function (pass) {
        return pass === this.password;
      },
      message: "Password are not same !! Check the password😉",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  hospital_name: {
    type: String,
    required: [true, "A patient must have assigned to any hospital"],
  },
  doctor_name: {
    type: String,
    required: [true, "A patient must have assigned to any doctor"],
  },

  surgery_date: {
    type: Date,
  },
  discharge_date: {
    type: Date,
  },
  disease: {
    type: String,
  },
  passwordChangedAt: {
    type: Date,
  },
});
patientSchema.pre("save", async function (next) {
  //Only run this if password was actually modified
  if (!this.isModified("password")) return next();

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12); //give salt

  //Delete the confirm password field
  this.passwordConfirm = undefined;

  next();
});

patientSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangeAt = Date.now() - 1000;

  next();
});

patientSchema.pre(/^find/, function (next) {
  //This point to user query
  this.find({ active: { $ne: false } });
  next();
});

patientSchema.methods.correctPassword = async function (
  newPassword,
  currentPassword
) {
  return await bcrypt.compare(newPassword, currentPassword);
};

patientSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  //false means not changed
  return false;
};

patientSchema.methods.createPasswordResetToken = function () {
  // Generate a random token as a hexadecimal string
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token using SHA256 for storage in the database
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set the hashed token and expiry time
  this.passwordResetToken = hashedToken;
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Return the unhashed token to be sent to the user
  return resetToken;
};

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
