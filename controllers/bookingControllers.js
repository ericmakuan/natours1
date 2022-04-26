const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');

const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async(req, res, next) => {
  // get booked tour
  const tour = await Tour.findById(req.params.tourId);
  console.log(req.params.tourId);
  //create check out session  需要再加保密    %20%20%20%20%20%20%20%20%20%20%20
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items:[
        {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images:[`https://www.natours.dev/img/tours/${tour.imageCover}`],
            amount: tour.price * 100,
            currency: 'usd',
            quantity: 1
        }
    ]
  });
  console.log(req.params.tourId);
  //create session as response
  res.status(200).json({
      status: 'success',
      session
  });
});

exports.createBookingCheckout = catchAsync(async(req, res, next) => {
  //暫時的 不隱密
  const { tour, user, price } = req.query;
  console.log(tour)
  // if ( !tour && !user && !price ) return next(); 
  if (!tour || !user || !price) { return next(); }



  await Booking.create({tour, user, price});

  res.redirect(req.originalUrl.split('?')[0]);
  //多一個req至host 再跑一次這個middleware 然後沒有tour user price 直接 return next 至下一個  
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);