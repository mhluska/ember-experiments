import Service from '@ember/service';
import camelizeName from 'ember-experiments/utils/camelize-name';
import { Promise }  from 'rsvp';
import { inject as service } from '@ember/service';
let {keys} = Object;

export default Service.extend({
  cookieName: 'ember-experiments',
  cookieMaxAge: 31536000, // default 1 year
  currentExperiments: null,

  cookies: service(),

  init() {
    this._super(arguments);
    this.getExperiments();
  },

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

      // check if this experiment is already setup
      if (this.alreadyDefined(expName)) {
        resolve(this.getVariation(expName));
        return;
      }

      expName = camelizeName(expName);

      // normalize the variations with a default a/b test
      if (keys(variations).length === 0) {
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
    // notify property change
    this.notifyPropertyChange(camelizeName(expName, variation));
  },

  isEnabled(experimentName, variationName) {
    let experiments = this.getExperiments();
    return experiments[experimentName] === variationName;
  },

  isEnabledConcatted(experimentAndVariation) {
    let experiments = this.getExperiments();
    let result = keys(experiments).find(key => {
      return experimentAndVariation === camelizeName(key, experiments[key]);
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
    let experiments = this.get('currentExperiments');

    if (experiments) {
      return experiments;
    }

    experiments = this.get('cookies').read(this.cookieName);
    if (!experiments) {
      return this.set('currentExperiments', {});
    }

    try {
      experiments = JSON.parse(decodeURI(experiments));
    } catch(error) {
      experiments = {};
    }

    return this.set('currentExperiments', experiments);
  },

  setExperiments(experiments = {}) {
    this.set('currentExperiments', experiments);
    experiments = encodeURI(JSON.stringify(experiments));
    this.get('cookies').write(this.cookieName, experiments, {maxAge: this.cookieMaxAge});
  },

  clearExperiments() {
    this.setExperiments();
  },

  unknownProperty(key) {
    let expKey = camelizeName(key);
    return this.isEnabledConcatted(expKey);
  },

  _determineVariation(variations = {}) {
    let variationChoice = Math.floor(Math.random() * 101);
    let sortedVariations = this._sortedVariations(variations);
    let result = sortedVariations.find(variation => variation[1] >= variationChoice);

    if (!result) {
      // this can only really happen if the passed in variant weights don't add up to 100...
      // what were they thinking?!?
      // oh well, select a random variant for the folks
      result = sortedVariations[Math.floor(Math.random() * sortedVariations.length)]
    }

    return result[0];
  },

  _sortedVariations(variations = {}) {
    let sortedVariations = [];
    let currentMax = 0;
    keys(variations).sort().forEach(key => {
      let amount = variations[key] || 0;
      currentMax = currentMax + amount;
      sortedVariations.push([key, currentMax]);
    });
    return sortedVariations;
  }
});
