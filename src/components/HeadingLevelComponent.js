const Case = require('Case');
const DOM = require('DOM');
var HeadingLevelComponent = function (test, options) {
  var priorLevel = false;
  DOM.scry(':header', test.get('scope')).forEach(function (element) {
    var level = parseInt(element.tagName.substr(-1, 1), 10);
    if (priorLevel === options.headingLevel && level > priorLevel + 1) {
      test.add(Case({
        element: this,
        status: 'failed'
      }));
    }
    else {
      test.add(Case({
        element: element,
        status: 'passed'
      }));
    }
    priorLevel = level;
  });
};
module.exports = HeadingLevelComponent;
