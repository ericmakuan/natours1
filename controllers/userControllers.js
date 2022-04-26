const multer = require('multer');  
const sharp = require('sharp');

const User = require('../models/userModel');

const catchAsync = require('../Utils/catchAsync');

const AppError = require('../Utils/appError');

const factory = require('./handlerFactory');



// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {  //cd跟next接近 但不是express內
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) =>{
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// })

const multerStorage = multer.memoryStorage(); //先暫存

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('not an image', 400), false)
  }

}

const upload = multer({ 
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async(req, res, next) => {
  if(!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  
  await sharp(req.file.buffer) //square image
  .resize(500, 500)
  .toFormat('jpeg')
  .jpeg({quality: 90})
  .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {  //找尋整個OBJ找到一樣的FIELD就依照其組成新ㄉOBJ
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el]
    });
    return newObj;
};

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//     const users = await User.find();//需在await 之前處理好query 

//     res.status(200).json({
//         status: 'success',
        
//         results: users.length,
//         data: {
//             users
//         }
//     });
// });
exports.getMe =  (req, res, next) => {
    req.params.id = req.user.id;
    next();
};


exports.updateMe = catchAsync(async(req, res, next) => {

  //Create if user post password
  if ( req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password update.', 400));
  }

  //update user doc
  const filteredBody = filterObj(req.body, 'name', 'email'); //要有所限制 不然會被改權限admin
  if (req.file) filteredBody.photo = req.file.filename;

  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {  
      new: true,
      runValidators: true
    }); 

  res.status(200).json({
    status: 'success',
    data: {
        user: updateUser
    }
    
    // results: users.length,
    // data: {
    //     users
    // }
  });
});

exports.deleteMe = catchAsync(async(req, res, next) => {
   await User.findByIdAndUpdate(req.user.id, {active: false})
   
   res.status(204).json({
    status: 'success',
    data: null
   });
});



exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error', 
        message: 'This is not defined pls use /sign up'
    });
}

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);// can not update password with this 
exports.deleteUser = factory.deleteOne(User);