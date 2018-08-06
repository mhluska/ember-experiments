import isTesting from 'dummy/utils/is-testing';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Utility | is-testing', function(hooks) {
  setupTest(hooks);

  test('returns true in the test environment', function(assert) {
    let result = isTesting(this.owner);

    assert.ok(result);
  });
});
