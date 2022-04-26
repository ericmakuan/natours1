const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required: [true, 'please tell your name']
      },
    email: {
      type: String,
      required: [true, 'please provude your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'please provude a valid email'] //validator裡驗證EMAIL的方法
    },
    photo: {
      type: String,
      default: 'default.jpg'
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user'
    },
    password:{
      type:String,
      required: [true, 'please provude a password'],
      minlength: 8,
      select: false
    },
    passwordConfirm:{
        type:String,
        required: [true, 'please confirm your password'],
        validate: {
            //只在save或save上有用
            validator: function(el) {
                return el === this.password;//對的話 return true
            },
            message: 'passwords are not the same'
          }
      },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    }
});

userSchema.pre('save', async function(next) {  //防止密碼外洩 回傳前加密
    //Only run this function if password was actually modified
  if (!this.isModified('password')) return next();  
  
  this.password = await bcrypt.hash(this.password, 12) //加密的複雜度
  this.passwordConfirm = undefined;//不需要儲存進去
  next(); 
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isNew) // 若密碼沒變則return
  return next();

  this.passwordChangedAt = Date.now() - 1000; //確保passwordchanged的時間在token生成之前
  next();
})

userSchema.pre(/^find/, function(next) {
  //this points to the current query
  this.find({active :{$ne: false}});
  next();
});

userSchema.methods.correctPassword = async function(
    candidiatePassword, userPassword) 
    {
    return await bcrypt.compare(candidiatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(
  JWTTimestamp) 
  {
    if(this.passwordChangedAt){
      const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);//除1000讓ms>>s

    // console.log(changedTimestamp, JWTTimestamp)
    return JWTTimestamp < changedTimestamp;// 代表密碼改變了 JWT是拿到TOKEN的時間 後面是改密碼的時間
    }
  return false;//意思為沒變
}

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = 
  crypto.createHash('sha256').update(resetToken).digest('hex');  //加密
  console.log({resetToken}, this.passwordResetToken)

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
}
const User = mongoose.model('User', userSchema);

module.exports = User;

