/* eslint-disable no-console */
const fs = require('fs');

const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');


const AppError = require('./Utils/appError');
const globalErrorHandler = require('./controllers/errorControllers');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingControllers');
const viewRouter = require('./routes/viewRoutes');


const app = express();

app.enable('trust proxy');//heroku會用proxy

app.set('view engine', 'pug');
app.set('views', path.join(__dirname,'views'));

//1 global middleware
app.use(cors()); //Access Control Allow Origin
app.options('*', cors())

app.use(express.static(path.join(__dirname,'public')));//serve static file

// console.log(process.env.NODE_ENV);

// app.use(helmet())

// // Further HELMET configuration for Security Policy (CSP)
// const scriptSrcUrls = [
//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
// ];
// const styleSrcUrls = [
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com/",
//     "https://a.tiles.mapbox.com/",
//     "https://b.tiles.mapbox.com/",
//     "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [
//     'fonts.googleapis.com',
//     'fonts.gstatic.com'
// ];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: ["'none'"],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: ["'none'"],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:"
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );

// Set security HTTP headers
// app.use(
//     helmet({
//       crossOriginEmbedderPolicy: false,
//     })
//   );
   
//   // Further HELMET configuration for Security Policy (CSP)
//   const scriptSrcUrls = [
//     'https://api.tiles.mapbox.com/',
//     'https://api.mapbox.com/',
//     'https://*.cloudflare.com',
//   ];
//   const styleSrcUrls = [
//     'https://api.mapbox.com/',
//     'https://api.tiles.mapbox.com/',
//     'https://fonts.googleapis.com/',
//     'https://www.myfonts.com/fonts/radomir-tinkov/gilroy/*',
//   ];
//   const connectSrcUrls = [
//     'https://*.mapbox.com/',
//     'https://*.cloudflare.com',
//     'http://127.0.0.1:3000',
//     'http://localhost:3000'
//   ];
   
//   const fontSrcUrls = [
//     'fonts.googleapis.com',
//     'fonts.gstatic.com',
//   ];
   
  // app.use(
  //   helmet.contentSecurityPolicy({
  //     directives: {
  //       defaultSrc: ["'none'"],
  //       connectSrc: ["'self'", ...connectSrcUrls],
  //       scriptSrc: ["'self'", ...scriptSrcUrls],
  //       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
  //       workerSrc: ["'self'", 'blob:'],
  //       objectSrc: ["'none'"],
  //       imgSrc: ["'self'", 'blob:', 'data:'],
  //       fontSrc: ["'self'", ...fontSrcUrls],
  //     },
  //   })
  // );
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
          baseUri: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          scriptSrc: [
            "'self'",
            'https:',
            'http:',
            'blob:',
            'https://*.mapbox.com',
            'https://js.stripe.com',
            'https://m.stripe.network',
            'https://*.cloudflare.com',
          ],
          frameSrc: ["'self'", 'https://js.stripe.com'],
          objectSrc: ["'none'"],
          styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
          workerSrc: [
            "'self'",
            'data:',
            'blob:',
            'https://*.tiles.mapbox.com',
            'https://api.mapbox.com',
            'https://events.mapbox.com',
            'https://m.stripe.network',
          ],
          childSrc: ["'self'", 'blob:'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          formAction: ["'self'"],
          connectSrc: [
            "'self'",
            'data:',
            'blob:',
            'https://*.stripe.com',
            'https://*.mapbox.com',
            'https://*.cloudflare.com/',
            'https://bundle.js:*',
            'ws://127.0.0.1:*/',
   
          ],
          // upgradeInsecureRequests: [],
        },
      },
    })
  );

//development logging
if (process.env.NODE_ENV === 'development') 
{app.use(morgan('dev'))
};

//limit req from same api
const limiter = rateLimit ({
    max : 100,   //1個IP一小時最多傳100個REQ
    windowMs : 60*60*1000,
    message : 'Too many req, try again inan hour'
});
app.use('/api', limiter);//所有API開頭都會有這MIDDLEWARE


app.post('webhook-checkout',
 express.raw({ type: 'application/json'}),
 bookingController.webhookCheckout);//要在app.use(express.json( {limit: '10kb'}));這之前  不能是json


 //body parse, readind data from body into req.body
app.use(express.json( {limit: '10kb'}));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// data sanitization against NOSQL query injection
app.use(mongoSanitize());

//data sanitization against XSS
app.use(xss());

//http parameter pollution
app.use(hpp({
    whitelist:['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize','difficulty', 'price']//白名單
}));

app.use(compression())


// app.use(express.static(`${__dirname}/public`));//serve static file



//test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next();
});

// app.get('/', (req, res) => {
//     res.status(200).json({message: 'Hello from the server side!', name: 'natours'});
// });

// app.post('/', (req, res) => {
//     res.send('You can post to this endpoint...');
// });
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

//read all
// app.get('/api/v1/tours', (req, res) => {
//     res.status(200).json({
//         status: 'success',
//         results: tours.length,
//         data: {
//             tours
//         }
//     });
// });

//Read one tour
// app.get('/api/v1/tours/:id/:x?', (req, res) => {  //?能使其變為非必要  如沒加?則client必須指定否則err
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
// });

//Create
// app.post('/api/v1/tours', (req, res) => {
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
// });

// //Update
// app.patch('/api/v1/tours/:id', (req, res) => {  // update
//     if(req.params.id * 1 > tours.length) {  
//     return res.status(404).json({status: 'fail', message:'Invalid ID'});
//     };
//     res.status(200).json({
//         status: 'success', 
//         data: {
//             tour: 'Update tour here...'//找ID 讀 寫進去 
//         }
//     })
// })

//Delete
// app.delete('/api/v1/tours/:id', (req, res) => {  
//     if(req.params.id * 1 > tours.length) {  
//     return res.status(404).json({status: 'fail', message:'Invalid ID'});
//     };
//     res.status(204).json({ // 204表示no content
//         status: 'success', 
//         data: null
//     })
// })


////////////////////////////////////////////////////////////////
//整理 2 route handler
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
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id/:x?', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);


//3 route

//const tourRouter = express.Router(); //(取代app)   移去資料夾
// const userRouter = express.Router();

// app.get('/', (req, res) => {
//     res.status(200).render('base', {
//         tour: 'The Forest Hiker',
//         user:'Jones'

//     });
// });

// app.get('/overview', (req, res) => {
//     res.status(200).render('overview', {
//         title: 'All tours'
//     });
// });

// app.get('/tour', (req, res) => {
//     res.status(200).render('tour', {
//         title: 'The Forest Hiker Tour'
//     });
// });

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);//將middleware tourRouter用在這route中
app.use('/api/v1/users', userRouter);//分成subapp還是middleware
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//app.route('/api/v1/tours')//整理更清楚route handler
// tourRouter.route('/')
// .get(getAllTours)
// .post(createTour)

// app.use((req, res , next) => { //上面的不會被這影響 因為req,res循環已結束  
//     console.log('Hello from the middleware');
//     next();
// })

//app.route('/api/v1/tours/:id/:x?')
// tourRouter.route('/:id')
// .get(getTour)
// .patch(updateTour)
// .delete(deleteTour);

// userRouter.route('/')
// .get(getAllUsers)
// .post(createUser);

// userRouter.route('/:id')
// .get(getUser)
// .patch(updateUser)
// .delete(deleteUser);

//4 start server
// const port = 3000;

// app.listen(port, () =>{
//     console.log(`App running on port ${port}...`);
// });

//所有HTTP方法 all     當前面的routehandler都沒收到且沒res   就會跑到這middleware 代表沒有符合的URL  
app.all('*',(req, res, next) => {    //*號代表全部
    // // res.status(404).json({    
    // //     status:'fail',
    // //     message:`Can't find ${req.originalUrl} on this server`
    // // });
    // const err = new Error (`Can't find ${req.originalUrl} on this server`);
    // err.status = 'fail';
    // err.statusCode = 404; 

    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
// app.use((err, req, res, next) => {
//     console.log(err.stack);  //顯示哪裡有錯
//     err.statusCode = err.statusCode || 500;
//     err.status = err.status || 'error';

//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message
//     });
// })

module.exports = app;   