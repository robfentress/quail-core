const Case = require('Case');
var DOM = require('DOM');
var LabelComponent = function (test, options) {

  options = options || {};

  test.get('scope').forEach(function (scope) {
    DOM.scry(options.selector, scope).forEach(function (element) {
      let label = DOM.scry('label[for=' + element.getAttribute('id') + ']', scope);
      let parent = DOM.parent(element, 'label');
      if (!parent || !label) {
        test.add(Case({
          element: this,
          status: 'failed'
        }));
      }
      else {
        test.add(Case({
          element: this,
          status: 'passed'
        }));
      }
    });
  });
};
module.exports = LabelComponent;
