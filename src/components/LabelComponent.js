const Case = require('Case');
var DOM = require('DOM');
var LabelComponent = function (test, options) {

  options = options || {};

  test.get('scope').forEach(function (scope) {
    DOM.scry(options.selector, scope).forEach(function (element) {
      let label = DOM.scry('label[for=\"' + element.getAttribute('id') + '\"]', scope)[0];
      let labelParent = DOM.parents(element).find((parent) => DOM.is(parent, 'label'));
      let hasLabelText = false;
      let hasLabelParentText = false;
      if (label) {
        hasLabelText = /\S/.test(label.innerText);
      }
      if (labelParent) {
        hasLabelParentText = /\S/.test(labelParent.innerText);
      }
      if (!hasLabelText && !hasLabelParentText) {
        test.add(Case({
          element: element,
          status: 'failed'
        }));
      }
      else {
        test.add(Case({
          element: element,
          status: 'passed'
        }));
      }
    });
  });
};
module.exports = LabelComponent;
