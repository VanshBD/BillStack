const path = require('path');
const { basename, extname } = path;
const { globSync } = require('glob');

const appModelsFiles = globSync(path.join(__dirname, '../appModels/**/*.js').replace(/\\/g, '/'));

const pattern = path.join(__dirname, '../**/*.js').replace(/\\/g, '/');

const modelsFiles = globSync(pattern).map((filePath) => {
  const fileNameWithExtension = basename(filePath);
  const fileNameWithoutExtension = fileNameWithExtension.replace(
    extname(fileNameWithExtension),
    ''
  );
  return fileNameWithoutExtension;
});

const constrollersList = [];
const appModelsList = [];
const entityList = [];
const routesList = [];

for (const filePath of appModelsFiles) {
  const fileNameWithExtension = basename(filePath);
  const fileNameWithoutExtension = fileNameWithExtension.replace(
    extname(fileNameWithExtension),
    ''
  );
  const firstChar = fileNameWithoutExtension.charAt(0);
  const modelName = fileNameWithoutExtension.replace(firstChar, firstChar.toUpperCase());
  const fileNameLowerCaseFirstChar = fileNameWithoutExtension.replace(
    firstChar,
    firstChar.toLowerCase()
  );
  const entity = fileNameWithoutExtension.toLowerCase();

  controllerName = fileNameLowerCaseFirstChar + 'Controller';
  constrollersList.push(controllerName);
  appModelsList.push(modelName);
  entityList.push(entity);

  const route = {
    entity: entity,
    modelName: modelName,
    controllerName: controllerName,
  };
  routesList.push(route);
}

module.exports = { constrollersList, appModelsList, modelsFiles, entityList, routesList };
