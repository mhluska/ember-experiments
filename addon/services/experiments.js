import Service from '@ember/service';
import camelizeName from 'ember-experiments/utils/camelize-name';
import { Promise }  from 'rsvp';
import { inject as service } from '@ember/service';

export default Service.extend({
  cookieName: 'ember-experiments',

  cookies: service(),

  /**
   * Define a test and pass in possible variations
   *
   * @param {String} expName The name for your experiment
   * @param {Object} [variations={}] The variations you want to test
   * @returns
   */
  setup(expName, variations = {}) {
    return new Promise((resolve, reject) => {
      // if we don't have an experiment name, we don't know what to setup!
      if (!expName) {
        reject('Missing experiment name');
        return;
      }

      expName = camelizeName(expName);

      // normalize the variations with a default a/b test
      if (Object.keys(variations).length === 0) {
        variations = {
          control: 50,
          newVariation: 50
        }
      }

      // select the variation we want to use
      let variation = this._determineVariation(variations);

      this.enable(expName, variation);
      resolve(variation);
    });
  },

  enable(expName, variation) {
    if (!expName || !variation) {
      return;
    }

    expName = camelizeName(expName);
    variation = camelizeName(variation);

    let experiments = this.getExperiments();
    experiments[expName] = variation;
    this.setExperiments(experiments);
  },

  isEnabled(experimentAndVariation) {
    let experiments = this.getExperiments();
    let result = Object.keys(experiments).find(key => {
      let value = camelizeName(experiments[key]);
      key = camelizeName(key);
      return experimentAndVariation === `${key}${value}`;
    });

    return typeof(result) !== 'undefined';
  },

  getVariation(expName = '') {
    expName = camelizeName(expName);
    return this.getExperiments()[expName];
  },

  alreadyDefined(expName) {
    if (!expName) {
      return;
    }

    expName = camelizeName(expName);
    return typeof(this.getExperiments()[expName]) !== 'undefined';
  },

  getExperiments() {
    let experiments = this.get('cookies').read(this.cookieName);
    if (!experiments) {
      return {};
    }

    try {
      experiments = JSON.parse(decodeURI(experiments));
    } catch(error) {
      experiments = {};
    }

    return experiments;
  },

  setExperiments(experiments = {}) {
    experiments = encodeURI(JSON.stringify(experiments));
    this.get('cookies').write(this.cookieName, experiments, {maxAge: this.cookieMaxAge});
  },

  unknownProperty(key) {
    let expKey = camelizeName(key);
    return this.isEnabled(expKey);
  },

  _determineVariation(variations = {}) {
    let variationChoice = Math.floor(Math.random() * 101);
    let sortedVariations = this._sortedVariations(variations);
    let result = sortedVariations.find(variation => variation[1] >= variationChoice);
    return result[0];
  },

  _sortedVariations(variations = {}) {
    let sortedVariations = [];
    let currentMax = 0;
    Object.keys(variations).sort().forEach(key => {
      let amount = variations[key] || 0;
      currentMax = currentMax + amount;
      sortedVariations.push([key, currentMax]);
    });
    return sortedVariations;
  }
});
