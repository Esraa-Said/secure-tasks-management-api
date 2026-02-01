const httpStatusText = require("../utils/http-status-text");

const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    message = err.errors.map((e) => e.message);
  }

  res.status(statusCode).json({
    status: httpStatusText.ERROR,
    message,
  });
};

module.exports = globalErrorHandler;
