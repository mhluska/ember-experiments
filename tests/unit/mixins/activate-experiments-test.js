import EmberObject from '@ember/object';
import ActivateExperimentsMixin from 'ember-experiments/mixins/activate-experiments';
import { module, test } from 'qunit';

module('Unit | Mixin | activate-experiments', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ActivateExperimentsObject = EmberObject.extend(ActivateExperimentsMixin);
    let subject = ActivateExperimentsObject.create();
    assert.ok(subject);
  });
});
