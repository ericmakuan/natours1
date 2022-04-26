const Review = require('../models/reviewModel')
// const catchAsync =require('../Utils/catchAsync');
const factory = require('./handlerFactory');

// exports.getAllReviews = catchAsync(async (req, res ,next) =>{
//     let filter = {};
//     if (req.params.tourId) filter = { tour: req.params.tourId};//若routes裡有tour則加入tourId

//     const reviews = await Review.find(filter);

//     res.status(200).json({
//         status:'success',
//         results: reviews.length,
//         data: {
//             reviews
//         }
//     })
// });

    //allow nested routes
exports.setTourUserId = (req, res ,next) =>{
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
};

// exports.createReview = catchAsync(async (req, res ,next) =>{
    // //allow nested routes
    // if(!req.body.tour) req.body.tour = req.params.tourId;
    // if(!req.body.user) req.body.user = req.user.id;
//     const newReview = await Review.create(req.body);

//     res.status(201).json({
//         status:'success',
//         data: {
//             review: newReview
//         }
//     })
// });
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);