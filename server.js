const mongoose = require("mongoose");

const dotenv = require("dotenv");
process.on("uncaughtException", (err) => {
  console.log("uncaught exception! 💥 shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB connection successful...");
  });

// console.log(process.env);
const port = 4000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}... `);
});

process.on("unhandledRejection", (err) => {
  console.log("unhandled rejection! 💥 shutting down...");
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
