const schema = require('./src/controllers/appControllers/termsController/schemaValidate');

// Test your exact data
const testData = {
  title: "dcs cwsw dfcs fcs",
  content: "dsswc dce edwadc wfdcdws dcwsed\n cfwesdfcwsdfcxws cew fcwsdc\nf cewsdfcdws fcws fdc wsefc s\n cwsdfc wsefc ws f",
  isDefault: false
};

console.log('Testing data:', JSON.stringify(testData, null, 2));
console.log('Content length:', testData.content.length);

const { error, value } = schema.validate(testData);

if (error) {
  console.log('❌ Validation failed:');
  console.log('Error message:', error.details[0]?.message);
  console.log('Error details:', JSON.stringify(error.details, null, 2));
} else {
  console.log('✅ Validation passed!');
  console.log('Validated value:', JSON.stringify(value, null, 2));
}
