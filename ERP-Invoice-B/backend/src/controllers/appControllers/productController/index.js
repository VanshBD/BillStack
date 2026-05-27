const create = require('./create');
const read = require('./read');
const update = require('./update');
const list = require('./list');
const remove = require('./delete');
const search = require('./search');
const filter = require('./filter');
const summary = require('./summary');
const listAll = require('./listAll');

module.exports = {
  create,
  read,
  update,
  delete: remove,
  list,
  search,
  filter,
  summary,
  listAll,
};
