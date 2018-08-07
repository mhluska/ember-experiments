import { get } from '@ember/object';
import { getOwner } from '@ember/application';

export default function isTesting(context) {
  let config;

  if (context && get(context, 'resolveRegistration')) {
    config = context.resolveRegistration('config:environment');
  } else {
    config = getOwner(context).resolveRegistration('config:environment');
  }

  return config.environment === 'test';
}
