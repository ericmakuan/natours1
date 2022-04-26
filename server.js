/* eslint-disable no-console */
/* eslint-disable import/newline-after-import */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log('uncaughtException! Shut down..');
    console.log(err.name, err.message);
    
    process.exit(1);
}); 

dotenv.config({ path: './config.env'});//在執行前就需先指定 
const app = require('./app');


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);



mongoose
.connect(DB, { 
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: false
}).then(() => 
    console.log('DB connection successful'));

// const tourSchema = new mongoose.Schema({   //移至model進行MVC ARCH
//   name: {
//       type:String,
//       required: [true, 'A tour must have a name'],  //必須要有 否則跳錯誤  validtor 驗證器
//       unique: true  //必須獨特
//     },
//   rating: {
//       type: Number,
//       default: 4.5  //預設4.5
//     },
//   price: {
//     type: Number,
//     required: [true, 'A tour must have a price']
//   },
// });

// const Tour = mongoose.model('Tour', tourSchema);

// const testTour = new Tour({  //測試
//     name: 'The Park camper',
//     rating: 4.7,
//     price: 997
// });

// testTour.save().then(doc => {
//     console.log(doc);
// }).catch(err => {
//     console.log('ERROR:', err)
// });


// console.log(process.env);

const port = process.env.PORT || 3000;

const server = app.listen(port, () =>{
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log('unhandledRejection! Shut down..');
    console.log(err.name, err.message);
    
    server.close(() => {
    process.exit(1);
    }) 
});




