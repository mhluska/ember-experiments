import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | experiment', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    let service = this.owner.lookup('service:experiments');
    service.clearExperiments();
  });

  test('use template helper with enabled test', async function(assert) {
    let service = this.owner.lookup('service:experiments');

    service.enable('test1', 'a');

    await render(hbs`
      {{#if (experiment 'test1' 'a')}}
        test1A
      {{else}}
        test1B
      {{/if}}
    `);

    assert.equal(this.element.textContent.trim(), 'test1A');
    assert.notEqual(this.element.textContent.trim(), 'test1B');
  });

  test('use template helper with enabled test', async function(assert) {
    let service = this.owner.lookup('service:experiments');

    service.setup('test1', { b:100, c:0 });

    await render(hbs`
      {{#if (experiment 'test1' 'b')}}
        test1B is active
      {{/if}}
    `);

    assert.equal(this.element.textContent.trim(), 'test1B is active');
  });
});
