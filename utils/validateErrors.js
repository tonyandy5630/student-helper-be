exports.validateError = (cb, next) => {
  try {
    cb();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
