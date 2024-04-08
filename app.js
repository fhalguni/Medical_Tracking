const fs = require("fs");
const express = require("express");
const morgan = require("morgan");
const app = express();
const patientRouter = require("./routes/patientRoutes");

const hospitalRoutes = require("./routes/hospitalRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");

//1.Middleware
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "developement") {
  app.use(morgan("dev")); //Log every request to the console in a pretty format
}

app.use(express.json());

app.use(express.static(`${__dirname}/public`)); //Serve static files from public folder

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

const patients = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/patients.json`)
);

//Route Handlers

//routes

app.use("/api/v1/patients", patientRouter);

app.use("/api/v1/hospitals", hospitalRoutes);
app.use("/api/v1/doctors", doctorRoutes);
app.use("./api/v1/admin", adminRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server!`));
});

//error handling middleware
app.use(globalErrorHandler);
module.exports = app;
