const jwt = require("jsonwebtoken");
const Hospital = require("./../models/hospitalModel");
const catchAsync = require("./../utils/catchAsync");

exports.getAllHospitals = catchAsync(async (req, res, next) => {
  const hospitals = await Hospital.find();
  res.status(200).json({
    status: "success",
    results: hospitals.length,
    data: {
      hospitals,
    },
  });
});

exports.getHospital = async (req, res, next) => {
  const hospitals = await Hospital.findById(req.params.id);
  //Patient.findOne({_id:req.params.id})

  if (!hospitals) {
    return next(new AppError("No hospital found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      hospitals,
    },
  });
};

exports.createHospital = catchAsync(async (req, res, next) => {
  const newHospital = await Hospital.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      hospitals: newHospital,
    },
  });
});

exports.updateHospital = catchAsync(async (req, res, next) => {
  const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!hospital) {
    return next(new AppError("No hospital found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      hospital,
    },
  });
});

exports.deleteHospital = catchAsync(async (req, res, next) => {
  const hospital = await Hospital.findByIdAndDelete(req.params.id);

  if (!hospital) {
    return next(new AppError("No hospital found", 404));
  }
  res.status(204).json({
    status: "delete successfully",
    data: null,
  });
});
