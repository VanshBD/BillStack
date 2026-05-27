const create = require('./create');
const list = require('./list');
const update = require('./update');
const deleteBankAccount = require('./delete');
const read = require('./read');
const search = require('./search');
const filter = require('./filter');
const summary = require('./summary');
const listAll = require('./listAll');

module.exports = {
  create,
  list,
  update,
  delete: deleteBankAccount,
  read,
  search,
  filter,
  summary,
  listAll,
};
