const Case = require('Case');
var ContainsReadableTextComponent = require('ContainsReadableTextComponent');
var DOM = require('DOM');
var LabelComponent = function (test, options) {

  options = options || {};

  var scope = test.get('scope');
  scope.each(function () {
    var $local = $(this);
    DOM.scry(options.selector, $local).each(function () {
      if ((!$(this).parent('label').length ||
        !$local.find('label[for=' + $(this).attr('id') + ']').length ||
          !ContainsReadableTextComponent($(this).parent('label'))) &&
          (!ContainsReadableTextComponent($local.find('label[for=' + $(this).attr('id') + ']')))) {
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
