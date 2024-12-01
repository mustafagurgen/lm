module.exports = {
  responseSuccess: (res, message, data, statusCode = 200) => {
    return res.status(statusCode).json({
      message: message,
      data: data
     });
  },
  responseError: (res, errorCode, errorMessage, statusCode = 500) => {
    return res.status(statusCode).json({
      errorCode: errorCode,
      errorMessage: errorMessage
     });
  }
}