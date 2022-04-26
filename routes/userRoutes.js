const express = require('express');
 
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authControllers');



// const getAllUsers = (req, res) => {
//     res.status(500).json({   //500為暫時沒有
//         status: 'error', 
//         message: 'This is not yet defined'
//     });
// }
// const getUser = (req, res) => {
//     res.status(500).json({
//         status: 'error', 
//         message: 'This is not yet defined'
//     });
// }
// const createUser = (req, res) => {
//     res.status(500).json({
//         status: 'error', 
//         message: 'This is not yet defined'
//     });
// }
// const updateUser = (req, res) => {
//     res.status(500).json({
//         status: 'error', 
//         message: 'This is not yet defined'
//     });
// }
// const deleteUser = (req, res) => {
//     res.status(500).json({
//         status: 'error', 
//         message: 'This is not yet defined'
//     });
// }

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use( authController.protect);//這之後的都會protect

router.patch('/updateMyPassword',  authController.updatePassword);
router.get('/Me',  userController.getMe, userController.getUser);
router.patch('/updateMe', 
userController.uploadUserPhoto, 
userController.resizeUserPhoto,
userController.updateMe);
router.delete('/deleteMe',  userController.deleteMe);

router.use( authController.restrictTo('admin'));//這之後的都會只有admin能用

router.route('/')
.get(userController.getAllUsers)
.post(userController.createUser);

router.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser);


module.exports = router;

