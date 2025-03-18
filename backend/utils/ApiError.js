class ApiError extends Error {
  success;
  statusCode;
  errors;
  message;
  constructor(statusCode, errors, message, stack = null) {
    super(message);
    this.success = false;
    this.statusCode = statusCode;
    this.errors = errors;
    this.stack = stack;
    this.message = message;
  }
}
module.exports = ApiError;
