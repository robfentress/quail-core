/**
 * Test callback for tests that look for script events
 *  (like a mouse event has a keyboard event as well).
 */
const Case = require('Case');
var HasEventListenerComponent = require('HasEventListenerComponent');
var DOM = require('DOM');

var EventComponent = function (test, options) {
  test.get('scope').forEach((scope) => {
    var $items = options.selector && DOM.scry(options.selector, scope);
    // Bail if nothing was found.
    if ($items.length === 0) {
      test.add(Case({
        element: scope,
        status: 'inapplicable'
      }));
      return;
    }
    var searchEvent = options.searchEvent || '';
    var correspondingEvent = options.correspondingEvent || '';
    $items.forEach(function (item) {
      var eventName = searchEvent.replace('on', '');
      var hasOnListener = HasEventListenerComponent(item, eventName);
      // Determine if the element has jQuery listeners for the event.
      var jqevents;
      var $ = window.jQuery || window.$;
      if ($._data) {
        jqevents = $._data(this, 'events');
      }
      var hasjQueryOnListener = jqevents && jqevents[eventName] && !!jqevents[eventName].length;
      var hasCorrespondingEvent = !!correspondingEvent.length;
      var hasSpecificCorrespondingEvent = HasEventListenerComponent(item, correspondingEvent.replace('on', ''));
      var _case = test.add(Case({
        element: item
      }));
      if ((hasOnListener || hasjQueryOnListener) && (!hasCorrespondingEvent || !hasSpecificCorrespondingEvent)) {
        _case.set({
          status: 'failed'
        });
      }
      else {
        _case.set({
          status: 'passed'
        });
      }
    });
  });
};
module.exports = EventComponent;
