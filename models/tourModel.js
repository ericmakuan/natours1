const mongoose = require('mongoose');

const slugify = require('slugify');

// const User = require('./userModel');

// const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type:String,
        required: [true, 'A tour must have a name'],  //必須要有 否則跳錯誤  validator 驗證器
        unique: true,  //必須獨特
        trim:true,  //去頭尾的空白space
        maxlength: [40, 'A tour name must have less or equal than 40 characters'],
        minlength: [10, 'A tour name must have less or equal than 10 characters']
        // validate: [validator.isAlpha, 'A tour name must only contain characters']
      },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize:{
      type:Number,
      required: [true, 'A tour must have a  maxGroupSize']
    },
    difficulty:{
      type:String,
      required: [true, 'A tour must have a  difficulty'],
      enum:{
        values: ['easy', 'medium', 'difficult', ],
        message: 'difficulty is either: easy, medium, difficult'
      
      }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,  //預設4.5
        min:[1, 'Rating must be above 1'],
        max:[5, 'Rating must be below 5'],
        set: val => Math.round(val * 10) / 10 //四捨五入到小數點第一位
      },
    ratingsQuantity: {
        type: Number,
        default: 0  //預設4.5
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type:Number,
      validate: {
        validator: function(val) {
        // 在UPDATE上不可行 因為this只抓到create的DOC
        return val < this.price;  //跟price 比較
      } ,
      message: 'discount price ({VALUE}) should be below regular price'
    }
    },
    summary: {
      type:String,
      trim:true,
      required: [true, 'A tour must have a summary']
    },
    description:{
      type:String,
      trim:true
    },
    imageCover:{
      type:String,
      required: [true, 'A tour must have a image cover']
    },
    images: [String], //要array
    createdAt: {
      type: Date,
      dafault : Date.now(),
      select : false//預設不顯示
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation:{  //不是schema 是geospatial Data
      type:{
        type: String,
        default: 'Point', 
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point', 
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // guides: Array  用在embedded
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }//附上mongoDB的ID
    ]
    
  }
  ,{   toJSON: {virtuals: true},
       toObject: {virtuals: true}
   } 
     
  );

  // tourSchema.index({price: 1})
  tourSchema.index({ price: 1, ratingsAverage: -1 });
  tourSchema.index({ slug: 1 });
  tourSchema.index({ startLocation: '2dsphere' });
  
  tourSchema.virtual('durationWeeks').get(function() {
    return this.duration/7;
  });


  //virtual populate
  tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',  //想要virtual populate的物件在Review那邊的名字
    localField: '_id'  //這裡要儲存的  ID 之後再populate
  });

  //doc middleware: runs before .save() , .create()
  tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower :true});  //在儲存之前先變小寫  
    next();   
  });
   
  //將TOUR跟USER EMBEDDED起來
  // tourSchema.pre('save', async function(next) {
  //   const guidesPromises = this.guides.map(async id => await User.findById(id));
  //   this.guides = await Promise.all(guidesPromises);
  //   next();
  // });

  // tourSchema.pre('save', function(next) {
  //   console.log('will save doc...');
  //   next();   
  // });

  // tourSchema.post('save', function(doc, next) {
  //   console.log(doc);
  //   next(); 
  // });

//query middleware

  tourSchema.pre(/^find/, function(next) {   //所有以find為開頭的  例如 findOne 
    // tourSchema.pre('find', function(next) {  
    this.find({ secretTour: {$ne: true}})

    this.start = Date.now();
    next();   
  });
  
  tourSchema.pre(/^find/, function(next) {

    this.populate({
      path: 'guides',
      select: '-__v -passwordChangedAt'
   }) ;
   next();
  })

  tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`)
    // console.log(docs);
    next();
  });
  
  
//aggregation middleware

  // tourSchema.pre('aggregate', function(next) {
  //   this.pipeline().unshift({ $match: { secretTour: {$ne: true}}});
  //   console.log(this.pipeline());
  //   next();
  // });

  const Tour = mongoose.model('Tour', tourSchema);

  module.exports = Tour ;
  