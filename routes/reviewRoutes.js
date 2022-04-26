const express = require('express');

const reviewController = require('../controllers/reviewControllers');
const authController = require('../controllers/authControllers')

const router = express.Router({ mergeParams: true});//使其params在fieidroute間可傳遞

router.use( authController.protect);//這之後的都會protect

router
 .route('/')
 .get(reviewController.getAllReviews)
 .post( authController.restrictTo('user'), 
 reviewController.setTourUserId, reviewController.createReview);

 router
 .route('/:id')
 .get(reviewController.getReview)
 .patch( authController.restrictTo('user','admin'), reviewController.updateReview)
 .delete( authController.restrictTo('user','admin'), reviewController.deleteReview)




module.exports = router;
