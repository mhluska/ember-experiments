import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | experiments', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    let service = this.owner.lookup('service:experiments');
    service.clearExperiments();
  });

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let service = this.owner.lookup('service:experiments');
    assert.ok(service);
  });

  test('it knows how to sort variations', function(assert) {
    let service = this.owner.lookup('service:experiments');
    assert.deepEqual(service._sortedVariations({a: 20, b:30, c:50}), [['a', 20], ['b', 50], ['c', 100]]);
    assert.deepEqual(service._sortedVariations({a: 50, b:20, c:10, d:20}), [['a', 50], ['b', 70], ['c', 80], ['d', 100]]);
  });

  test('it knows how to select a variation', function(assert) {
    let service = this.owner.lookup('service:experiments');
    let result = service._determineVariation({a:20,b:80});
    assert.ok(['a','b'].indexOf(result) !== -1);
  });

  test('it knows how to setup a/b experiments with no variations', function(assert) {
    let service = this.owner.lookup('service:experiments');
    service.setup('testNoVariations');
    assert.ok(['newVariation', 'control'].indexOf(service.getVariation('testNoVariations')) !== -1);
  });

  test('it returns a promise that has the variation in it', async function(assert) {
    let service = this.owner.lookup('service:experiments');
    let variation = await service.setup('testHere', {a: 100});
    assert.equal(variation, 'a');
  });

  test('it knows if a test has been defined and can give you the value', function(assert) {
    let service = this.owner.lookup('service:experiments');
    service.setup('test1', {a: 50, b: 50});
    let selectedTest = service.getVariation('test1');
    assert.ok(['a', 'b'].indexOf(selectedTest) !== -1);

    assert.ok(service.alreadyDefined('test1'));
  });

  test('it lets you pass-through boolean a test/variation being enabled', function(assert) {
    let service = this.owner.lookup('service:experiments');
    service.setup('test1', {a: 50, b: 50});
    service.enable('test1', 'a');
    assert.ok(service.get('test1A'));
  });

  test('it lets you enable a specific variation for a test', function(assert) {
    let service = this.owner.lookup('service:experiments');
    service.setup('test1', {a: 50, b: 50});
    service.enable('test1', 'notAnOption');
    let selectedTest = service.getVariation('test1');
    assert.equal(selectedTest, 'notAnOption');
  });

  test('if an experiment is already defined, it does not let you redefine it', function(assert) {
    let service = this.owner.lookup('service:experiments');
    service.setup('test42', {definitelyThis: 100});
    service.setup('test42', {a: 50, b: 50});

    assert.equal(service.getVariation('test42'), 'definitelyThis');
  });

  test('it knows how to explode an existing session', function(assert) {
    let service = this.owner.lookup('service:experiments');
    service.clearExperiments();
    assert.deepEqual(service.getExperiments(), {});
  });
});
