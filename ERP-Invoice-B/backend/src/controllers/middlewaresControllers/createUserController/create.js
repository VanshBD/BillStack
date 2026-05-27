const mongoose = require('mongoose');
const Joi = require('joi');
const { generate: uniqueId } = require('shortid');

const create = async (userModel, req, res) => {
  const UserModel = mongoose.model(userModel);
  const UserPasswordModel = mongoose.model(userModel + 'Password');

  const { name, email, surname, password, role } = req.body;

  // validate
  const objectSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email({ tlds: { allow: true } }).required(),
    password: Joi.string().min(6).required(),
    surname: Joi.string().allow('', null),
    role: Joi.string().allow('', null),
  });

  const { error, value } = objectSchema.validate({ name, email, password, surname, role });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid/Missing required fields for user create.',
      errorMessage: error.message,
    });
  }

  // check duplicate
  const existing = await UserModel.findOne({ email: email, removed: false }).exec();
  if (existing)
    return res.status(409).json({
      success: false,
      result: null,
      message: 'This email is already registered.',
    });

  // create user
  const userData = { name, email, surname, role: role || 'owner', enabled: true };
  const newUser = await new UserModel(userData).save();

  // create user password doc
  const salt = uniqueId();
  const newUserPassword = new UserPasswordModel();
  const passwordHash = newUserPassword.generateHash(salt, password);
  const passwordDoc = new UserPasswordModel({
    user: newUser._id,
    password: passwordHash,
    salt,
    emailVerified: true,
  });
  await passwordDoc.save();

  return res.status(200).json({
    success: true,
    result: newUser,
    message: 'Successfully Created the user',
  });
};

module.exports = create;
