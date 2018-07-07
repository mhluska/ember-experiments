import { camelize }  from '@ember/string';

export default function camelizeName(experimentName, variationName) {
  return camelize([experimentName, variationName].join('_'));
}
