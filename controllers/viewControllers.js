const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
    // get data from collection
    const tours = await Tour.find();
    //build templated 

    //render that template using data
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    //get data
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour) {
      return next(new AppError('There is no tour with that name', 404))
    }


    //build template
    

    //render template
    // res
    // .status(200)
    // .set(
    //   'Content-Security-Policy',
    //   "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    // )
    // .render('tour', {
    //   title: `${tour.name} Tour`,
    //   tour,
    // });
    res
    .status(200)
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getLoginForm = (req, res) => {
  res.status(200).set(
    'Content-Security-Policy',
            "connect-src 'self' http://127.0.0.1:3000/"
  ).render('login', {
    title: 'Log into  your account'
  }); 
}

exports.getAccount = (req, res) => {
  res.status(200).set(
    'Content-Security-Policy',
            "connect-src 'self' http://127.0.0.1:3000/"
  ).render('account', {
    title: 'your account'
  });
}

exports.getMyTours = catchAsync(async(req, res, next) => {
  //find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  //find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour); 
  const tours = await Tour.find({ _id: {$in: tourIDs}})

  res.status(200).set(
    'Content-Security-Policy',
            "connect-src 'self' http://127.0.0.1:3000/"
  ).render('overview', {
    title: 'My tours',
    tours
  });
});



exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(req.user.id, {
    name: req.body.name,
    email: req.body.email
  },
  {
    new: true,
    runValidators: true
  });
  res.status(200).set(
    'Content-Security-Policy',
            "connect-src 'self' http://127.0.0.1:3000/"
  ).render('account', {
    title: 'your account',
    user: updatedUser
  });
})