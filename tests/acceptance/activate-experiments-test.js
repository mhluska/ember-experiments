import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | activate experiments', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /activate', async function(assert) {
    await visit('/activate?experiments=test1/variation1');
    let service = this.owner.lookup('service:experiments');

    assert.equal(service.getVariation('test1'), 'variation1');
  });

  test('visiting /activate', async function(assert) {
    await visit('/activate?experiments=test1/variation1,test2/variation2');
    let service = this.owner.lookup('service:experiments');

    assert.equal(service.getVariation('test1'), 'variation1');
    assert.equal(service.getVariation('test2'), 'variation2');
  });
});
