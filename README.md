# Ember Experiments
A split testing framework for easily adding multivariate or A/B testing to Ember applications

## Installation

* `ember install ember-experiments`

## Defining Experiments

### Basic A/B Experiments
A/B testing allows you to split your audience into 2 test groups

```javascript
  // app/routes/application.js
  import Route from '@ember/routing/route';
  import { inject as service } from '@ember/service';

  export default Route.extend({
    experiments: service(),

    setupController(controller, model) {
      this._super(controller, model);

      this.get('experiments').setup('experimentName', {
        a: 50, // the provided int determins what percentage of users should receive this variation
        b: 50
      });
    }
  });

```
In the above example, 50% of users will receive variant a and 50% will receive variant b

### Accessing variations in js

```javascript
  //app/components/my-component.js
  import Component from '@ember/component';
  import { inject as service } from '@ember/service';

  export default Component.extend({
    experiments: service(),
    didInsertElement() {
      console.log('current variation', this.get('experiments').getVariation('experimentName'));
      console.log('are we in variation a?', this.get('experiments').isEnabled('experimentName', 'a'));
    }
```

### Accessing variations in templates
You also have access to experiment selections by concatting them together as camelCase.  For example, if your experiment is named `user test 1` and your variations are `a` and `b`, you could access them in templates as:

```handlebars
  {{#if userTest1A}}
    Here we are in variation A
  {{else if userTest1B}}
    Here we are in variation B
  {{/if}}
```

### Multivariate Testing
In addition to traditional A/B testing, you can also specify multivariate tests as well (A/B/C/D)
```javascript
  import Route from '@ember/routing/route';
  import { inject as service } from '@ember/service';

  export default Route.extend({
    experiments: service(),

    setupController(controller, model) {
      this._super(controller, model);

      this.get('experiments').setup('experimentName', {
        a: 10,
        b: 50,
        c: 40
      });
    }
  });

```

In the above example, 10% of users will get variant a, 50% will get variant b and 40% will get variant c


### Working with promises or route hooks
The `setup` method returns a promise, allowing you to delay rendering until a variant is picked if needed
```javascript
  import Route from '@ember/routing/route';
  import { inject as service } from '@ember/service';

  export default Route.extend({
    experiments: service(),

    model() {
      return this.get('experiments').setup('experimentName', {
        a: 50,
        b: 50
      }).then(variation => {
        switch(variation) {
          case 'a':
            // do the things we want to do with variation a
            break;
          case 'b':
            // do the things we want to do with variation b
            break;
        }
      });
    }
  });

```

### Manually enabling test variations
If you need to manually enable/disable any test variations, you can do so by pulling in the provided `activate-experiments` mixin into your `Application` route.

```javascript
  import Route from '@ember/routing/route';
  import ActivateExeriments from 'ember-experiments/mixins/activate-experiments';

  export default Route.extend(ActivateExeriments, {
  });

```
Once that's done, you can then activate any experiment by adding `?experiments=expName/variantName` to your URL. To activate multiple tests, add them using CSV `?experiments=expName/variantName,expName2/variantName2`.

### Using Ember-Experiments with Ember-Metrics
[Ember-Metrics](https://github.com/poteto/ember-metrics) is a great library for adding various metric libraries to your app, such as Google Tag Manager or Mixpanel.  Ember-Experiments has been made to work easily with the library to add experiment data to event calls.  To do so, you'll want to extend the ember-metrics service in your app

```javascript
// app/services/metrics

import Metrics from 'ember-metrics/services/metrics';

export default Metrics.extend({
  trackEvent(...args) {
    let eventData = args[args.length - 1];
    args[args.length - 1] = Object.assign({}, eventData, this.get('experiments').getExperiments());
    this._super(...args);
  }
});
```


### Good To Know's
* It's safe to setup the same test as many times as you'd like, the test is enabled and a variant is selected on the first `setup`.  Subsequent setups will abort immediately and return the originally selected variant.
* Selected variants are stored in a cookie set to expire by default in 365 days.  You can extend the `exeriments` service and set `cookieName` and `cookieMaxAge` to customize these values.

## Experiments Service API

* `setup('experimentName', variations = {})` Allows you to setup an experiment for future use.  Variations is an object containing possible variations as keys, and the probability of hitting that variation as an int for the value.  Returns a promise with the selected variant as the only parameter
* `enable('experimentName', 'variantName')` Force enable a variant for an experiment.  The experiment does NOT need to be predefined, and you do NOT need to specify a variant that was passed into a `setup` call.  You can force experiments to any variant name you'd like
* `isEnabled('experimentName', 'variantName')` Returns true/false based on if `experimentName` is currently set to `variantName`
* `getVariation('experimentName')` Returns the current variation for a provided experiment
* `alreadyDefined('experimentName')` Returns true/false based on if an experiment has already been setup
* `getExperiments()` Returns an object of experiments as keys with their current variant as values
* `setExperiments({experimentName: variantName})` Allows you to force-set all experiments to specific values
* `clearExperiments()` Clear all experiments

## Contributing
Package uses npm 6.1+ for dependency management. If you're adding a new dependency, please make sure you run `npm i` before pushing back upstream.

### Getting Started
* `get clone` this repository
* `npm i` in the created folder

### PR Requirements
* All new functionality should be submitted with tests
* Please run `npm i` before opening a PR if you're adding a new dependency

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

## License

This project is licensed under the [MIT License](LICENSE.md).
