const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!.'],
  },
  email: {
    type: String,
    required: [true, 'Please tell your email!.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email id.'],
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password.'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!.',
    },
  },
  mobile: {
    type: Number,
    validate: {
      validator: function (val) {
        // https://stackoverflow.com/questions/3813195/regular-expression-for-indian-mobile-numbers/3813226
        // eslint-disable-next-line no-useless-escape
        return /^(?:(?:\+|0{0,2})91(\s*[\ -]\s*)?|[0]?)?[789]\d{9}|(\d[ -]?){10}\d$/.test(val);
      },
      message: (props) => `${props.value} is not a valid phone number!.`,
    },
    required: [true, 'Please provide your phone number.'],
    select: false,
  },
  address: {
    type: mongoose.Schema.ObjectId,
    ref: 'ShoppingCart',
  },
  photo: {
    type: String,
    default: '/public/img/users/default.jpg',
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);

  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email) {
  const user = await this.findOne({ email });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * Check if password is changed after token issued
 * @param {numeber} JWTTimestamp
 * @returns {boolean}
 */
userSchema.methods.changedPasswordAfterToken = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < passwordChangedTimestamp;
  }

  // false means that the user does not change password after token issued.
  return false;
};

/**
 * Create password reset token and save to the database
 * @returns {string} resetToken
 */
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // console.log({ resetToken }, this.passwordResetToken, this.passwordResetExpires);

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
