import { moduleFor, test } from 'ember-qunit';

moduleFor('service:experiments', 'Unit | Service | experiments', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
  integration: true
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});

test('it knows how to sort variations', function(assert) {
  let service = this.subject();
  assert.deepEqual(service._sortedVariations({a: 20, b:30, c:50}), [['a', 20], ['b', 50], ['c', 100]]);
  assert.deepEqual(service._sortedVariations({a: 50, b:20, c:10, d:20}), [['a', 50], ['b', 70], ['c', 80], ['d', 100]]);
});

test('it knows how to select a variation', function(assert) {
  let service = this.subject();
  let result = service._determineVariation({a:20,b:80});
  assert.ok(['a','b'].indexOf(result) !== -1);
});

test('it knows how to setup a/b experiments with no variations', function(assert) {
  let service = this.subject();
  service.setup('testNoVariations');
  assert.ok(['newVariation', 'control'].indexOf(service.getVariation('testNoVariations')) !== -1);
});

test('it returns a promise that has the variation in it', async function(assert) {
  let service = this.subject();
  let variation = await service.setup('testHere', {a: 100});
  assert.equal(variation, 'a');
});
