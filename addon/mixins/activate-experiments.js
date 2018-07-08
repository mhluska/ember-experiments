import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';

export default Mixin.create({
  experiments: service(),
  beforeModel(transition) {
    let qp = transition.queryParams;
    let experiments = qp.experiments;

    if (experiments) {
      experiments = experiments.split(',').map(e => e.split('/'));
      experiments.forEach(e => {
        if (e.length === 2) {
          this.get('experiments').enable(e[0], e[1]);
        }
      })
    }

    this._super(...arguments);
  }
});
