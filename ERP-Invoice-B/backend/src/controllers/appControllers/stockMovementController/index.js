const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');

const methods = createCRUDController('StockMovement');

const create = require('./create');
const validateCreate = require('./validate');
const list = require('./list').list;
const read = require('./read');
const update = require('./update');

methods.create = create;
methods.validateCreate = validateCreate;
methods.list = list;
methods.read = read;
methods.update = update;
const correct = require('./correct');
methods.correct = correct;

module.exports = methods;
