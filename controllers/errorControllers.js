
const AppError = require("../Utils/appError");

const handleCastErrorDB = err => {  //將DB的錯誤轉成APPERROR
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];  //match在message裡被""起來的字串
  
  const message =`Duplicate field value: ${value}, Please ues another value!`
  return new AppError(message, 400);
};

const handleValidationErrorDB =err => {
  //將錯誤元素分割出來並和再一起加上格式
  const errors = Object.values(err.errors).map(el => el.message);
  const message =`Invalid input data. ${errors.join('. ')}`;  

  return new AppError(message, 400);
};

const handleJWTEError = () => new AppError('Invalid token. Please log in again', 401);

const handleJWTExpiredError = () => new AppError('Your token is expired. Please log in again', 401);

const sendErrorDev = (err, req, res) => {
    //API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } 
    //renderd website
    console.error('ERROR', err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message
    });
}

const sendErrorProd = (err, req, res) => {
  //API
  if(req.originalUrl.startsWith('/api')) {
  if (err.isOperational) {  //Operational error: send message to client
    return res.status(err.statusCode).json({
    status: err.status,
    message: err.message
    });
  }    
     //Programming or other unknown error: don't leak error details 
      console.error('ERROR', err); //  顯示在自己console

      return res.status(500).json({
      statue:'error',
      message: 'Something went very wrong!'
    });
 }  
   //renderd website
  if (err.isOperational) {  //Operational error: send message to client
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message
    });
  }   
   //Programming or other unknown error: don't leak error details 
      console.error('ERROR', err); //  顯示在自己console

      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: 'Please try again later.'
      });
};

module.exports = (err, req, res, next) => {
    // console.log(err.stack);  //顯示哪裡有錯
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {
      sendErrorDev(err, req, res);
    }
    else if (process.env.NODE_ENV.trim() === 'production') {  //給客戶用較簡潔的
      //mongo的的錯誤不會顯示在isOperational  要自己訂
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      // let error = { ...err };
      // let error = err;
      // let error = JSON.stringify(err);
      // error = JSON.parse(error);
      // error.message = err.message
      let error = Object.assign(err);
      if (error.name === 'CastError') error = handleCastErrorDB(error);
      if (error.code === 11000) error = handleDuplicateFieldsDB(error);
      if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
      if (error.name === 'JsonWebTokenError') error = handleJWTEError();
      if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
      sendErrorProd(err, req, res);
    }    
};