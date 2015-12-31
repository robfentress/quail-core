const Case = require('Case');
var DOM = require('DOM');
var LabelComponent = function (test, options) {

  options = options || {};

  var scope = test.get('scope');
  scope.forEach(function (local) {
    DOM.scry(options.selector, local).forEach(function (element) {
      let label = DOM.scry('label[for=' + element.getAttribute('id') + ']', local);
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
