const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');

const methods = createCRUDController('Category');

const create = require('./create');
const update = require('./update');
const remove = require('./remove');

methods.create = create;
methods.update = update;
methods.delete = remove;

module.exports = methods;
