/* eslint-disable no-console */
/* eslint-disable prefer-object-spread */
// const fs = require('fs');
const multer = require('multer');  
const sharp = require('sharp');
const Tour = require('../models/tourModel');
// const APIFeatures = require('../Utils/apiFeatures');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const factory = require('./handlerFactory');

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

exports.uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
]);

exports.resizeTourImages = catchAsync(async(req, res, next) => {

    if(!req.files.imageCover || !req.files.images) return next();
    //cover image
    req.body.imageCover = `tour-${req.user.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
     .toFormat('jpeg')
     .jpeg({quality: 90})
     .toFile(`public/img/tours/${req.body.imageCover}`);
    
  
    //images
    req.body.images = [];   

    await Promise.all(
     req.files.images.map(async (file, i) => {
        const filename = `tour-${req.user.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
      .resize(2000, 1333)
       .toFormat('jpeg')
       .jpeg({quality: 90})
       .toFile(`public/img/tours/${filename}`);
     
     req.body.images.push(filename);
 })
);
next()
})

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// exports.checkID = (req, res, next, val) => { //mongo會檢查
//     console.log(`tour id is: ${val}`);
//     if(req.params.id * 1 > tours.length) {  
//         return res.status(404)
//         .json({status: 'fail', message:'Invalid ID'});
       
//       };
//       next();
// } 

// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status: 'fail', 
//             message:'missing name or price'
//         })
//     }
//     next();
// }




// const getAllTours =(req, res) => {
// exports.getAllTours = catchAsync(async (req, res, next) => {
    //   console.log(req.requestTime);
    // try {
        //Build Query
        // const queryObj = { ...req.query };  //新的OBJ且不會影響到舊的
        // const excludedFields = ['page', 'sort', 'limit', 'fields'];
        // excludedFields.forEach(el => delete queryObj[el]);//去除上面所圈選的

        // console.log(req.query, queryObj);

        // let queryStr = JSON.stringify(queryObj);// 將其變string 
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // //g表示可以重複多次   將特定字串加上$以使其應用在MONGOOSE裡
        

        // let query = Tour.find(JSON.parse(queryStr))//檢索
        // .where('duration')  //filter
        // .equals(5);
        
        //sorting  排序
        // if(req.query.sort) {
        //     const sortBy = req.query.sort.split(',').join(' ');
        //   query = query.sort(sortBy);
        // } else {
        //     query = query.sort('_id');  //若沒有SORT 則預設按照id順序 時間有問題
        // };

        //field limiting
        // if (req.query.fields) {
        //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields);
        // } else {
        //     query = query.select('-__v');//將__V除外
        // };

        //pagination   page=2&limit=10  意思是一頁最多10個  而要取第2頁
        // const page = req.query.page * 1 || 1; //預設為1 第一頁
        // const limit = req.query.limit * 1 || 100;
        // const skip = (page - 1) * limit;
        // query = query.skip(skip).limit(limit);

        // if (req.query.page) {
        //     const numTours = await Tour.countDocuments();
        //     if (skip >= numTours) throw new Error('This page does not exist');
        // }

        //Execute Query
    //     const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
    //     const tours = await features.query;//需在await 之前處理好query 

    // res.status(200).json({
    //     status: 'success',
        
    //     results: tours.length,
    //     data: {
    //         tours
    //     }
    // });
    // } catch (err) {
    //     res.status(404).json({
    //         status: 'fail', 
    //         message: err})
    // }

//
// const getTour = (req, res) => {  //?能使其變為非必要  如沒加?則client必須指定否則err.populate('guides');
// exports.getTour = catchAsync(async (req, res, next) => {
//     // try {
//         const tour = await Tour.findById( req.params.id ).populate('reviews');
//             if(!tour) { 
//             return next(new AppError('No tourfound with that ID', 404))
//         }

//         res.status(200).json({
//                 status: 'success',
//                 data: {
//                     tour
//                 }
//             }); 
//     } catch (err) {
//         res.status(404).json({
//             status: 'fail', 
//             message: err
//     });
//  }

    // console.log(req.params);//能拿到想要的變數
    // const id = req.params.id * 1; //轉換string to number
   
    // const Tour = tours.find(el => el.id === id);//array methods
    
    // // // if(id > tours.length) {
    // // if(!Tour) { //Tour有問題的意思
    // // return res.status(404).json({status: 'fail', message:'Invalid ID'});
    // // };

    // res.status(200).json({
    //     status: 'success',
    //     data: {
    //         tours:Tour
    //     }
    // });




// const createTour = (req, res) => {
// exports.createTour = catchAsync(async (req, res, next) => {
//     const newTour = await Tour.create(req.body);

//     res.status(201).json({
//         status: 'success', 
//         data:{
//             tour: newTour
//         }
//       });
// });
    // try {
    // // console.log(req.body);

    // const newTour = await Tour.create(req.body);

    // res.status(201).json({
    //     status: 'success', 
    //     data:{
    //         tour: newTour
    //     }
    //   });
    // } catch (err) {
    //     res.status(400).json({
    //         status: 'fail', 
    //         message:err
    //     })

    // const newId = tours[tours.length-1].id + 1;
    // const newTour = Object.assign({id: newId }, req.body); //新ID的BODY

    // tours.push(newTour);//將新ID的BODY推進去
    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours), err => {
    //   res.status(201).json({
    //     status: 'success', 
    //     data:{
    //         tour: newTour
    //     }
    //   });
    // })
    // res.send('Done');只能res一次


// const updateTour = (req, res) => {  // update
// exports.updateTour = catchAsync(async (req, res, next) => {
//     // if(req.params.id * 1 > tours.length) {  移到上面
//     // return res.status(404).json({status: 'fail', message:'Invalid ID'});
//     // };
//     // try {
//         const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//             new: true,
//             runValidators: true
//         });
//         if (!tour) {
//             return next(new AppError('No tourfound with that ID', 404))
//         };
//         res.status(200).json({
//         status: 'success', 
//         data: {
//             tour//找ID 讀 寫進去 
//         }
//     });
// } catch (err) {res.status(404).json({
//     status: 'fail', 
//     message: err
// });
    // res.status(200).json({
    //     status: 'success', 
    //     data: {
    //         tour: 'Update tour here...'//找ID 讀 寫進去 
    //     }
    // })
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour,{path: 'reviews'});
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);


// exports.deleteTour = catchAsync(async (req, res, next) => {   
//     // try {
//         const tour = await Tour.findByIdAndDelete(req.params.id);
//         if (!tour) {
//             return next(new AppError('No tourfound with that ID', 404))
//         }
//         res.status(204).json({ // 204表示no content
//             status: 'success', 
//             data: null
//         });

exports.getTourStats = catchAsync(async (req, res, next) => {
    // try {
      const stats = await Tour.aggregate([
          {$match: {ratingsAverage: { $gte : 4.5}}},
          {$group:{
           _id: { $toUpper: '$difficulty'},    //組成群組
           num: { $sum :1},
           numRatings: { $sum: '$ratingsQuantity'},
           avgRating: { $avg: '$ratingsAverage'},
           avgPrice: { $avg: '$price'},
           minPrice: { $min: '$price'},
           maxPrice: { $max: '$price'}
         }
        },
        {$sort: {avgPrice : 1 }  //排序
        },
        // {$match: {_id: { $ne : 'EASY'}}} //去掉easy
      ]);
      res.status(200).json({
        status: 'success', 
        data: {
           stats
        }
    });
//     } catch (err) {res.status(404).json({
//         status: 'fail', 
//         message: err
//     });
//   }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    //  try {
       const year = req.params.year * 1;

       const plan = await Tour.aggregate([
           {
               $unwind: '$startDates'    //將他依照這array拆開來
           },
           {
               $match: {
                   startDates: {
                   $gte: new Date(`${year}-01-01`),
                   $lte: new Date(`${year}-12-31`)
                }
            }  
           },
           {
               $group: {
                   _id: { $month: '$startDates'},
                   numTourStarts: { $sum: 1},
                   tours: { $push: '$name'}
               }
           },
            {
                $addFields: { month: '$_id'}
            },
            {
                $project : { _id: 0  //將_id這一Field不顯示
                }
            },
            {
                $sort: { numTourStarts: -1}
            },
            {
                $limit:   12
            }


       ]);

       res.status(200).json({
        status: 'success', 
        data: {
           plan
        }
    });
    //  } catch (err) {
    //     res.status(404).json({
    //     status: 'fail', 
    //     message: err
    // });
    // }  
});

exports.getToursWithin = catchAsync(async(req, res, next) => {
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance/ 3963.2 : distance / 6378.1

    if (!lat || !lng) {
        next (
            new AppError(
                'Please provide latitutr and longitude in the format lat,lng',
                400
            )
        );
    }
    const tours = await Tour.find({ 
        startLocation: { $geoWithin:{ $centerSphere: [[lng, lat], radius]}} })

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
           data: tours
        }
    });

})

exports.getDistances = catchAsync(async(req, res, next) => {
    const {latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');
    
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001; //不是mile的話就是meter 把它變kilometer

    if (!lat || !lng) {
        next (
            new AppError(
                'Please provide latitutr and longitude in the format lat,lng',
                400
            )
        );
    }
    const distances = await Tour.aggregate([
        {
            $geoNear: { 
                near: {
                    type:'Point',
                    coordinates: [lng * 1 , lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
                
        },
        {
            $project: { 
                distance: 1,
                name: 1
                }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
           data: distances
        }
    });

})