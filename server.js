const express = require("express");
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const sequelize = require("./config/connectDB");
const globalErrorHandler = require("./middlewares/global-error-middleware");
const CustomError = require("./utils/custom-error");
const authRouter = require("./routes/auth-routes");
const taskRouter = require("./routes/task-routes");

// sequelize.authenticate().then(() => {
//    console.log('Connection has been established successfully.');
// }).catch((error) => {
//    console.error('Unable to connect to the database: ', error);
// });

const app = express();

app.use(cors());

app.use(express.json());
app.use(morgan("dev"));

app.use("/auth", authRouter);
app.use("/task", taskRouter);

app.use((req, res, next) => {
  next(new CustomError(`Invalid url`, 404));
});

// Global Error Middleware
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
sequelize
  // .sync({ alter: true })
  .sync()
  .then(() => {
    app.listen(process.env.PORT);
    console.log("Server listening on port " + PORT);
  })
  .catch((err) => {
    console.log(err);
  });
