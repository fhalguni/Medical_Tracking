const AppError = require("../utils/appError");
const Patient = require("./../models/patientModel");
const catchAsync = require("./../utils/catchAsync");
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
