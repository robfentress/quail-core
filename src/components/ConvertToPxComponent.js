/**
 * Converts units to pixels.
 */
const DOM = require('DOM');
var ConvertToPxComponent = function (unit) {
  if (unit.search('px') > -1) {
    return parseInt(unit, 10);
  }
  var div = document.createElement('div');
  div.style.display = 'none';
  div.style.height = unit;
  document.body.appendChild(div);
  var height = DOM.getComputedStyle(div, 'height');
  document.body.removeChild(div);
  return parseInt(height, 10);
};
module.exports = ConvertToPxComponent;
