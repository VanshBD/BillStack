const Joi = require('joi');

const mongoose = require('mongoose');

const checkAndCorrectURL = require('./checkAndCorrectURL');
const sendMail = require('./sendMail');
const shortid = require('shortid');
const { loadSettings } = require('@/middlewares/settings');

const { useAppSettings } = require('@/settings');

const forgetPassword = async (req, res, { userModel }) => {
  const UserPassword = mongoose.model(userModel + 'Password');
  const User = mongoose.model(userModel);
  const { email } = req.body;

  // validate
  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
  });

  const { error, value } = objectSchema.validate({ email });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid email.',
      errorMessage: error.message,
    });
  }

  const user = await User.findOne({ email: email, removed: false });
  const databasePassword = await UserPassword.findOne({ user: user._id, removed: false });

  // console.log(user);
  if (!user)
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No account with this email has been registered.',
    });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

  await UserPassword.findOneAndUpdate(
    { user: user._id },
    { otp, otpExpiry },
    {
      new: true,
    }
  ).exec();

  const settings = useAppSettings();
  const billstack_app_email = settings['billstack_app_email'];

  await sendMail({
    email,
    name: user.name,
    otp,
    subject: 'Reset your password | ERP System',
    billstack_app_email,
    type: 'otpVerification',
  });

  return res.status(200).json({
    success: true,
    result: null,
    message: 'Check your email inbox for the OTP to reset your password',
  });
};

module.exports = forgetPassword;
