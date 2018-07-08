import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default Helper.extend({
  experiments: service(),

  compute([experimentName, variationName]) {
    return this.get('experiments').isEnabled(experimentName, variationName);
  }
});
