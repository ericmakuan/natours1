// class AppError extends Error {
//     constructor(message, statusCode) {
//         super(message);

//         this.statusCode = statusCode;
//         this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';//開頭是4是F 不然是E    
//         this.isOperational = true;

//         Error.captureStackTrace(this, this.constructor);
//     }
// }
// module.exports = AppError;
class AppError extends Error {
    constructor(message, statusCode) {
      super()
   
      this.message = message
      this.statusCode = statusCode
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
      this.isOperational = true
   
      Error.captureStackTrace(this, this.constructor)
    }
  }
   
  module.exports = AppError