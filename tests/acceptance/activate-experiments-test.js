import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupExperiments from 'ember-experiments/test-support/setup-experiments';

module('Acceptance | activate experiments', function(hooks) {
  setupApplicationTest(hooks);
  setupExperiments(hooks);

  test('visiting /activate can set an experiments', async function(assert) {
    await visit('/activate?experiments=test1/variation1');
    let service = this.owner.lookup('service:experiments');

    assert.equal(service.getVariation('test1'), 'variation1');
  });

  test('visiting /activate can set two experiments', async function(assert) {
    await visit('/activate?experiments=test1/variation1,test2/variation2');
    let service = this.owner.lookup('service:experiments');

    assert.equal(service.getVariation('test1'), 'variation1');
    assert.equal(service.getVariation('test2'), 'variation2');
  });

  test('setup an experiment in a test and it is torn down', async function(assert) {
    this.experiments.enable('test1', 'variation1');
    await visit('/activate');
    let service = this.owner.lookup('service:experiments');

    assert.ok(service.isEnabled('test1', 'variation1'));
    assert.notOk(service.isEnabled('test2', 'variation2'));
  });

  test('setup an experiment in a test and it is torn down', async function(assert) {
    this.experiments.enable('test2', 'variation2');

    await visit('/activate');
    let service = this.owner.lookup('service:experiments');

    assert.ok(service.isEnabled('test2', 'variation2'));
    assert.notOk(service.isEnabled('test1', 'variation1'));
  });
});
