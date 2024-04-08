const jwt = require("jsonwebtoken");
const Doctor = require("./../models/doctorModel");
const catchAsync = require("./../utils/catchAsync");

exports.getAllDoctors = catchAsync(async (req, res, next) => {
  const doctors = await Doctor.find();
  res.status(200).json({
    status: "success",
    results: doctors.length,
    data: {
      doctors,
    },
  });
});

exports.getDoctor = async (req, res, next) => {
  const doctors = await Doctor.findById(req.params.id);
  //Patient.findOne({_id:req.params.id})

  if (!doctors) {
    return next(new AppError("No doctor found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      doctors,
    },
  });
};

exports.createDoctor = catchAsync(async (req, res, next) => {
  const newDoctor = await Doctor.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      doctors: newDoctor,
    },
  });
});

exports.updateDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!doctor) {
    return next(new AppError("No doctor found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      doctor,
    },
  });
});

exports.deleteDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);

  if (!doctor) {
    return next(new AppError("No doctor found", 404));
  }
  res.status(204).json({
    status: "delete successfully",
    data: null,
  });
});
