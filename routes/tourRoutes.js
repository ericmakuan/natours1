/* eslint-disable import/no-useless-path-segments */
// const fs = require('fs');

const express = require('express');

const tourController = require('./../controllers/tourControllers');

const authController = require('./../controllers/authControllers');
const reviewRouter = require('../routes/reviewRoutes');

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// const getAllTours =(req, res) => {
//     console.log(req.requestTime);
//     res.status(200).json({
//         status: 'success',
//         requestAt: req.requestTime,
//         results: tours.length,
//         data: {
//             tours
//         }
//     });
// };

// const getTour = (req, res) => {  //?能使其變為非必要  如沒加?則client必須指定否則err
//     console.log(req.params);//能拿到想要的變數
//     const id = req.params.id * 1; //轉換string to number
   
//     const Tour = tours.find(el => el.id === id);//array methods
    
//     // if(id > tours.length) {
//     if(!Tour) { //Tour有問題的意思
//     return res.status(404).json({status: 'fail', message:'Invalid ID'});
//     };

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tours:Tour
//         }
//     });
// }

// const createTour = (req, res) => {
//     // console.log(req.body);

//     const newId = tours[tours.length-1].id + 1;
//     const newTour = Object.assign({id: newId }, req.body); //新ID的BODY

//     tours.push(newTour);//將新ID的BODY推進去
//     fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours), err => {
//       res.status(201).json({
//         status: 'success', 
//         data:{
//             tour: newTour
//         }
//       });
//     })
//     // res.send('Done');只能res一次
// }

// const updateTour = (req, res) => {  // update
//     if(req.params.id * 1 > tours.length) {  
//     return res.status(404).json({status: 'fail', message:'Invalid ID'});
//     };
//     res.status(200).json({
//         status: 'success', 
//         data: {
//             tour: 'Update tour here...'//找ID 讀 寫進去 
//         }
//     })
// }

// const deleteTour = (req, res) => {  
//     if(req.params.id * 1 > tours.length) {  
//     return res.status(404).json({status: 'fail', message:'Invalid ID'});
//     };
//     res.status(204).json({ // 204表示no content
//         status: 'success', 
//         data: null
//     })
// }

///////
const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);//用tourroute接著做reviewRoute

// router.param('id', tourController.checkID);

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(authController.protect, 
    authController.restrictTo('admin', 'lead-guide', 'guide'),
 tourController.getMonthlyPlan);


router.route('/tours-within/:distance/center/:latlng/unit/:unit')
       .get(tourController.getToursWithin) //latlng是經緯度

router.route('/distances/:latlng/unit/:unit')
       .get(tourController.getDistances);    


router.route('/')
.get(tourController.getAllTours)
.post(authController.protect, 
    authController.restrictTo('admin', 'lead-guide'), 
    tourController.createTour);

router.route('/:id')
.get(tourController.getTour)
.patch(authController.protect, 
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour)
    
.delete(authController.protect, 
    authController.restrictTo('admin', 'lead-guide'), 
    tourController.deleteTour);

// router.route('/:tourId/reviews')
//       .post(authController.protect, 
//         authController.restrictTo('user'), 
//         reviewController.createReview);
    
    

module.exports = router ;