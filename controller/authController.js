const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const Patient = require("./../models/patientModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: "success",
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await Patient.create({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    hospital_name: req.body.hospital_name,
    doctor_name: req.body.doctor_name,
    surgery_date: req.body.surgery_date,
    discharge_date: req.body.discharge_date,
    disease: req.body.disease,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1.check email and password if exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  //2.check if user exists && password is correct
  const user = await Patient.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  //3.If everyThing is ok , send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1.Getting the token and check if its their
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in", 401));
  }

  //2.Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3.Check if user still exists
  const freshUser = await Patient.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        "The user belongging to this token does no longer exist",
        401
      )
    );
  }

  //4.Check if user changed password after the  token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password plz login again", 401)
    );
  }

  //Grant access to protected route
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to perform this action on this resource",
          403
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1.Get user based on Posted email
  const user = await Patient.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with this email", 404));
  }

  //2.Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3.Send it to users email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/patients/resetPassword/${resetToken}`;
  const message = `Forgot your password ? submit a patch request with your new password and passwordConfirm to:${resetURL}.\n If you didnt forgot your password please ignore this message`;

  try {
    await sendEmail({
      email: user.email,
      subject: "your password reset token valid for 10min",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined),
      await user.save();

    return next(
      new AppError(
        "There is a error to sending the email. Try  again later!",
        500
      )
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1.get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  console.log(hashedToken);
  const user = await Patient.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2.if token has not expired ,and there is a user,set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  if (user.password != user.passwordConfirm) {
    return next(new AppError("Password should be same", 400));
  }
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //3.update changedPasswordAt property for the current user
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });

  //4.Log the user in, send JWT
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1.get user from the collection
  const user = await Patient.findById(req.user.id).select("+password");

  //2.Check if posted current password is correct
  if (!user.correctPassword(req.body.passwordCurrent, user.password)) {
    return next(new AppError("Your current password is wrong", 401));
  }

  //3.If so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //user findByIdAndUpdate will not work as intended

  //4.Log user in, send jwt
  res.status(200).json({
    status: "success",
    message: "Password update successfully",
  });
});
