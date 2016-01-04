/**
 * Returns whether an element has an event handler or not.
 */
const DOM = require('DOM');
var HasEventListenerComponent = function (element, event) {
  var onEventAttr = DOM.getAttribute(element, 'on' + event);
  if (onEventAttr) {
    return true;
  }
  // jQuery events are stored in private objects
  var $ = window.jQuery || window.$ || {};
  if ($._data) {
    if (
      $._data(element, 'events') &&
      typeof $._data(element, 'events')[event] !== 'undefined'
    ) {
      return true;
    }
  }
  // Certain elements always have default events, so we create a new element to compare default events.
  if (DOM.is(element, 'a[href], input, button, video, textarea') &&
    typeof element[event] !== 'undefined' &&
    (event === 'click' || event === 'focus')) {
    if (element[event].toString().search(/^\s*function\s*(\b[a-z$_][a-z0-9$_]*\b)*\s*\((|([a-z$_][a-z0-9$_]*)(\s*,[a-z$_][a-z0-9$_]*)*)\)\s*{\s*\[native code\]\s*}\s*$/i) > -1) {
      return false;
    }
  }
  return typeof element[event] !== 'undefined';
};
module.exports = HasEventListenerComponent;
