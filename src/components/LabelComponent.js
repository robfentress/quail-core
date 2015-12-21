const Case = require('Case');
var ContainsReadableTextComponent = require('ContainsReadableTextComponent');
var DOM = require('DOM');
var LabelComponent = function (test, options) {

  options = options || {};

  var scope = test.get('scope');
  scope.each(function () {
    var $local = $(this);
    DOM.scry(options.selector, $local).each(function () {
      let label = DOM.scry('label[for=' + $(this).attr('id') + ']', $local);
      let parent = $(this).parent('label');
      if (!parent.length || !label.length) {
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
