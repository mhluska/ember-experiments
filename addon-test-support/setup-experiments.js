import { settled } from '@ember/test-helpers';

export default function setupExperiments(hooks = self) {
  hooks.beforeEach(function() {
    if (!this.owner) {
      throw new Error(`You must call one of the ember-qunit setupTest(),
      setupRenderingTest() or setupApplicationTest() methods before
      calling setupExperiments()`);
    }

    let experiments = this.owner.lookup('service:experiments');

    if (experiments) {
      this.experiments = experiments
    }
  });

  hooks.afterEach(function() {
    return settled().then(() => {
      if(this.experiments && typeof this.experiments.clearExperiments === 'function') {
        this.experiments.clearExperiments()
      }
    });
  });
}
