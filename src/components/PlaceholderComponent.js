/**
 * Placeholder test - checks that an attribute or the content of an
 * element itself is not a placeholder (i.e. 'click here' for links).
 */
const Case = require('Case');
var CleanStringComponent = require('CleanStringComponent');
var IsUnreadable = require('IsUnreadable');
var PlaceholdersStringsComponent = require('PlaceholdersStringsComponent');
var DOM = require('DOM');

var PlaceholderComponent = function (test, options) {

  var resolve = function (element, resolution) {
    test.add(Case({
      element: element,
      status: resolution
    }));
  };

  DOM.scry(options.selector, test.get('scope')).forEach(function (element) {
    var text = '';
    if (element.style.display === 'none' && !DOM.is(element, 'title')) {
      resolve(element, 'inapplicable');
      return;
    }
    if (typeof options.attribute !== 'undefined') {
      if ((typeof $(element).attr(options.attribute) === 'undefined' ||
            (options.attribute === 'tabindex' &&
              $(element).attr(options.attribute) <= 0
            )
         ) &&
         !options.content
        ) {
        resolve(element, 'failed');
        return;
      }
      else {
        if ($(element).attr(options.attribute) && $(element).attr(options.attribute) !== 'undefined') {
          text += $(element).attr(options.attribute);
        }
      }
    }
    if (typeof options.attribute === 'undefined' ||
      !options.attribute ||
      options.content) {
      text += $(element).text();
      DOM.scry('img[alt]', $(element)).forEach(function (element) {
        text += element.getAttribute('alt');
      });
    }
    if (typeof text === 'string' && text.length > 0) {
      text = CleanStringComponent(text);
      var regex = /^([0-9]*)(k|kb|mb|k bytes|k byte)$/g;
      var regexResults = regex.exec(text.toLowerCase());
      if (regexResults && regexResults[0].length) {
        resolve(element, 'failed');
      }
      else if (options.empty && IsUnreadable(text)) {
        resolve(element, 'failed');
      }
      else if (PlaceholdersStringsComponent.indexOf(text) > -1) {
        resolve(element, 'failed');
      }
      // It passes.
      else {
        resolve(element, 'passed');
      }
    }
    else {
      if (options.empty && typeof text !== 'number') {
        resolve(element, 'failed');
      }
    }
  });
};
module.exports = PlaceholderComponent;
