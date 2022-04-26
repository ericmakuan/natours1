const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const APIFeatures = require('../Utils/apiFeatures');


exports.deleteOne = Model => //用來帶入其他model
    catchAsync (async (req, res, next) => {   
   
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) {
            return next(new AppError('No tourfound with that ID', 404))
        }
        res.status(204).json({ // 204表示no content
            status: 'success', 
            data: null
    });
});



exports.updateOne = Model => catchAsync(async (req, res, next) => {
    // if(req.params.id * 1 > tours.length) {  移到上面
    // return res.status(404).json({status: 'fail', message:'Invalid ID'});
    // };
    // try {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc) {
            return next(new AppError('No document found with that ID', 404))
        };
        res.status(200).json({
        status: 'success', 
        data: {
           data: doc//找ID 讀 寫進去 
        }
    });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
        status: 'success',  
        data:{
            data: doc
        }
      });
});

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {

    let query = Model.findById(req.params.id);   
    if(popOptions) query = query.populate(popOptions);  //加入populate的東西
    const doc = await query;
 
            if(!doc) { 
            return next(new AppError('No document found with that ID', 404))
        }

        res.status(200).json({
                status: 'success',
                data: {
                    data: doc
                }
            }); 
    });

exports.getAll = Model => catchAsync(async (req, res, next) => {
    let filter = {}; //nested routes for review
    if (req.params.tourId) filter = { tour: req.params.tourId};

    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;//需在await 之前處理好query    

res.status(200).json({
    status: 'success',
    
    results: doc.length,
    data: {
        data: doc
    }
});
});