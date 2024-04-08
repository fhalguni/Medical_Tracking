const AppError = require("../utils/appError");
const Patient = require("./../models/patientModel");
const catchAsync = require("./../utils/catchAsync");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllPatients = catchAsync(async (req, res, next) => {
  // Build query object
  const patients = await Patient.find();
  const queryObj = { ...req.query };
  const excludeFields = ["page", "limit", "sort", "fields"];
  excludeFields.forEach((el) => delete queryObj[el]);

  // Execute query
  // const patients = await Patient.find(queryObj);

  res.status(200).json({
    status: "success",
    result: patients.length,
    data: {
      patients,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //1. Create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates, Please use /updateMyPassword",
        400
      )
    );
  }

  const filteredBody = filterObj(req.body, "name", "email");
  //2. update the user document
  const updatedUser = await Patient.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    user: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await Patient.findByIdAndDelete(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getPatient = catchAsync(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id);
  //Patient.findOne({_id:req.params.id})

  if (!patient) {
    return next(new AppError("No patient found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      patient,
    },
  });
});

exports.createNewPatient = catchAsync(async (req, res, next) => {
  const newPatient = await Patient.create(req.body).then();

  res.status(201).json({
    status: "success",
    data: {
      patients: newPatient,
    },
  });
});

exports.updatePatient = catchAsync(async (req, res, next) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!patient) {
    return next(new AppError("No patient found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      patient,
    },
  });
});

exports.deletePatient = catchAsync(async (req, res, next) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);

  if (!patient) {
    return next(new AppError("No patient found", 404));
  }
  res.status(204).json({
    status: "delete successfully",
    data: null,
  });
});
