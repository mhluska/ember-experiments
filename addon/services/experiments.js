import { Promise }  from 'rsvp';
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import isTesting from 'ember-experiments/utils/is-testing';
import camelizeName from 'ember-experiments/utils/camelize-name';


let { keys } = Object;

export default Service.extend({
  cookieName: 'ember-experiments',
  cookieMaxAge: 31536000, // default 1 year
  currentExperiments: null,


  cookies: service(),

  init() {
    this._super(arguments);
    this.getExperiments();
    this.isTesting = isTesting(this);
  },

  /**
   * Define a test and pass in possible variations
   *
   * @param {String} expName The name for your experiment
   * @param {Object} [variations={}] The variations you want to test
   * @returns {Promise}
   */
  setup(expName, variations = {}, options = {}) {
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

      // when environment === test us the inTesting variation
      if (this.isTesting && options.inTesting) {
        variation = options.inTesting;
      }

      this.enable(expName, variation);
      resolve(variation);
    });
  },

  /**
   * Force a specific experiment to a specific variant
   *
   * @param {String} expName
   * @param {String} variation
   * @returns {Null}
   */
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

  /**
   * Check if an experiment is currently set to a specified variant
   *
   * @param {String} experimentName
   * @param {String} variationName
   * @returns {Boolean}
   */
  isEnabled(experimentName, variationName) {
    let experiments = this.getExperiments();
    return experiments[experimentName] === variationName;
  },

  /**
   * Returns the selected variant for a given experiment
   *
   * @param {String} [expName='']
   * @returns {String}
   */
  getVariation(expName = '') {
    expName = camelizeName(expName);
    return this.getExperiments()[expName];
  },

  /**
   * Tells you if a test has already been setup
   *
   * @param {String} expName
   * @returns {Boolean}
   */
  alreadyDefined(expName) {
    if (!expName) {
      return;
    }

    expName = camelizeName(expName);
    return typeof(this.getExperiments()[expName]) !== 'undefined';
  },

  /**
   * Returns a Javascript Object with existing experiments as keys
   * and their selected variants as values
   *
   * @returns {Object}
   */
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

  /**
   * Allows you to force all experiments to provided values
   *
   * @param {Object} [experiments={}]
   */
  setExperiments(experiments = {}) {
    this.set('currentExperiments', experiments);
    experiments = encodeURI(JSON.stringify(experiments));

    this.get('cookies').write(this.cookieName, experiments, {
      maxAge: this.cookieMaxAge,
      path: '/'
    });
  },

  /**
   * Clears all experiments
   */
  clearExperiments() {
    this.setExperiments();
  },

  /**
   * Internal - used to route unknown requests to check for experiment variations
   *
   * @param {String} key
   * @returns {String}
   */
  unknownProperty(key) {
    let expKey = camelizeName(key);
    return this._isEnabledConcatted(expKey);
  },

  /**
   * Internal - Takes a list of variations and weights and determins which variation this specific user gets
   *
   *
   * @param {Object} [variations={}]
   * @returns {String}
   */
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

  /**
   * Internal - Takes a variations object and returns a sorted variations array
   *
   * @param {Object} [variations={}]
   * @returns {Array}
   */
  _sortedVariations(variations = {}) {
    let sortedVariations = [];
    let currentMax = 0;
    keys(variations).sort().forEach(key => {
      let amount = variations[key] || 0;
      currentMax = currentMax + amount;
      sortedVariations.push([key, currentMax]);
    });
    return sortedVariations;
  },

  /**
   * Internal: Check for concatted experiment/variant name combinations
   *
   * @param {String} experimentAndVariation
   * @returns {Boolean}
   */
  _isEnabledConcatted(experimentAndVariation) {
    let experiments = this.getExperiments();
    let result = keys(experiments).find(key => {
      return experimentAndVariation === camelizeName(key, experiments[key]);
    });

    return typeof(result) !== 'undefined';
  },
});
