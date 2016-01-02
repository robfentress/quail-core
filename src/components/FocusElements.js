/**
 * Elements that can (naturally) receive keyboard focus.
 */
const DOM = require('DOM');
const FocusElements = function (context) {
  let selector = [
    'a[href]',
    'area[href]',
    'input',
    'select',
    'textarea',
    'button',
    'iframe',
    'object',
    'embed',
    '*[tabindex]',
    '*[contenteditable]'
  ].join(', ');
  let elements = DOM
    .scry(selector, context)
    .filter((element) => !element.disabled);
  return elements;
};

module.exports = FocusElements;
