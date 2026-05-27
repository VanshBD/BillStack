const { routesList } = require('./src/models/utils');

console.log('Generated Routes:');
console.log(JSON.stringify(routesList, null, 2));
