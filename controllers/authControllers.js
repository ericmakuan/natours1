
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const Email = require('../Utils/email');

// eslint-disable-next-line arrow-body-style
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {   //payload跟secret
    expiresIn: process.env.JWT_EXPIRES_IN
 });
};

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id)
    
    res.cookie('jwt', token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24 *60 *60 *1000),
        
        httpOnly: true,
        secure: req.secure || req.headers('x-forworded-proto') === 'https' 
    });   
     // if (req.secure || req.headers('x-forworded-proto') === 'https') cookieOptions.secure = true;

    
    //不顯示密碼
    user.password = undefined;

    res.status(statusCode).json({ 
     status: 'success',
     token,
     data: {
         user
     }    
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });
    
    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(url);
    await new Email(newUser, url).sendWelcome();

    // const newUser = await User.create({    以此會更安全  使REQ不包含惡意CODE
    //     name: req.body.name,
    //     email: req.body.email,
    //     .......以下省略
    createSendToken(newUser, 201, req, res);
    // const token = signToken(newUser._id)

    // res.status(201).json({ 
    //  status: 'success',
    //  token,
    //  data: {
    //      user: newUser
    //  }    
    // });
});

exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;//一次兩個  由於指定的變數跟body裡的Field依樣
    //檢查信箱跟密碼存不存在
    if(!email || !password) {
        return next(new AppError('please provide email and password', 400));

    }
    // 檢查USER在不再  密碼對不對
    const user = await User.findOne({ email }).select('+password');//因為密碼在schema預設不顯示


    if(!user || !( await user.correctPassword(password, user.password))) {  //在這裡跑可以避免掉user找不到造成錯誤
        return next(new AppError('Incorrect email or password', 401))
    }

    //都對的話 把token送回去
    createSendToken(user, 200, req, res);
    // const token = signToken(user._id)
    // res.status(200).json({ 
    //     status: 'success',
    //     token
        
    //    });
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10*1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
}

exports.protect = catchAsync(async(req ,res, next) => {
    let token;
    //getting token and check of it's there
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) { //如果沒有在bearer裡則查看cookie
        token = req.cookies.jwt;
    }
    // console.log(token);

    if(!token) {
        return next(new AppError('You are not logged in', 401)); //401送出正確但沒有權限
    }
    //Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);//使其回傳promise
    // console.log (decoded)  //ERROR HANDLE在errorcontroller

    //Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist'))
    }

    //check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)){ //iat是issue of at 抓時間?
      return next( new AppError('User recently changed password! Please log in again', 401))
      }

    req.user = currentUser;
    res.locals.user = currentUser;
    next();//通過protect
});

//only for randring pages no error
exports.isLoggedIn = async(req ,res, next) => {
    if (req.cookies.jwt) {
        try{

    //Verification token
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);//使其回傳promise
    // console.log (decoded)  //ERROR HANDLE在errorcontroller

    //Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next()
    }

    //check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)){ //iat是issue of at 抓時間?
      return next( )
      }
    //there is a logged in user
    res.locals.user = currentUser;
    return next();//通過protect
 } catch (err) {
     return next();
 }
 }
 next()
};

// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {  //變array
    return (req, res, next) => {
        //roles is an array  //使用array方法
        if (!roles.includes(req.user.role)) {
            return next( new AppError('You do not have the permission to perform this action', 403))
        }
        next();
    }
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //get email
    const user = await User.findOne({email: req.body.email})
    if (!user) {
        return next( new AppError('There is no user with email', 404));
    }

    //generate Token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});  //儲存前先不要validator

    //send to email
 
    
    try {
    const resetURL = 
        `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}}`
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
        status: 'success',
        message: 'Token sent to email'
    })
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next (new AppError('There was an error sending the email. Try again leter'), 500)
    }
}); 
    



exports.resetPassword =catchAsync( async(req, res, next) => {
    //get user based on Token
    const hashedToken = 
    crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
         passwordResetToken: hashedToken, 
         passwordResetExpires: { $gt: Date.now()}
        });
     
    //if token has not expired, and there is user, set the new password
    if (!user) {
        return next (new AppError('Token is invalid or has inspired', 400))
    };
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //update passwordChangedAt property for the user

    //log the user in, send jwt
    createSendToken(user, 200, req, res);
    // const token = signToken(user._id)
    // res.status(200).json({ 
    //     status: 'success',
    //     token
        
    //    });
}); 

exports.updatePassword = catchAsync(async(req, res, next) => {
    //get user fron collection
    const user = await User.findById(req.user.id).select('+password');

    //check if posted current password is correctPassword
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next (new AppError('Your current password is incorrect', 401))
    }

    //updete password 
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //Log user in, send jwt
    createSendToken(user, 200, req, res);
});