import camelizeName from 'dummy/utils/camelize-name';
import { module, test } from 'qunit';

module('Unit | Utility | camelize name');

test('it knows how to camelize just an experiment name', function(assert) {
  let result = camelizeName('test name here');
  assert.equal(result, 'testNameHere');
});

test('it knows how to camelize experiements with variations', function(assert) {
  let result = camelizeName('test name here', 'test variation here');
  assert.equal(result, 'testNameHereTestVariationHere');
})
