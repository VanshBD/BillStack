const Joi = require('joi');
const mongoose = require('mongoose');
const shortid = require('shortid');

const verifyOtp = async (req, res, { userModel }) => {
  const UserPassword = mongoose.model(userModel + 'Password');
  const User = mongoose.model(userModel);
  const { email, otp } = req.body;

  // validate
  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    otp: Joi.string().required(),
  });

  const { error } = objectSchema.validate({ email, otp });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid input.',
      errorMessage: error.message,
    });
  }

  const user = await User.findOne({ email: email, removed: false });

  if (!user)
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No account with this email has been registered.',
    });

  const databasePassword = await UserPassword.findOne({ user: user._id, removed: false });

  if (!databasePassword || databasePassword.otp !== otp) {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'Invalid OTP.',
    });
  }

  if (new Date() > databasePassword.otpExpiry) {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'OTP has expired.',
    });
  }

  // OTP is valid, generate resetToken for the next step
  const resetToken = shortid.generate();
  await UserPassword.findOneAndUpdate(
    { user: user._id },
    { 
      resetToken, 
      otp: null, 
      otpExpiry: null 
    },
    { new: true }
  ).exec();

  return res.status(200).json({
    success: true,
    result: {
        userId: user._id,
        resetToken: resetToken
    },
    message: 'OTP verified successfully.',
  });
};

module.exports = verifyOtp;
