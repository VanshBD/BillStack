const create = require('./create');
const list = require('./list');
const update = require('./update');
const deleteTerms = require('./delete');
const findById = require('./findById');
const getDefault = require('./getDefault');
const read = require('./read');
const search = require('./search');
const filter = require('./filter');
const summary = require('./summary');
const listAll = require('./listAll');

module.exports = {
  create,
  list,
  update,
  delete: deleteTerms,
  read: findById,
  search,
  filter,
  summary,
  listAll,
  getDefault,
};
