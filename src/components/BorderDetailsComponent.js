const DOM = require('DOM');
var BorderDetailsComponent = function (element) {
  var borders = new Map();
  [
    'top',
    'right',
    'bottom',
    'left'
  ].forEach((side) => {
    let width = DOM.getComputedStyle(element, 'border-' + side + '-width');
    width = parseInt(width.slice(0, -2), 10);
    let style = DOM.getComputedStyle(element, 'border-' + side + '-style');
    let color = DOM.getComputedStyle(element, 'border-' + side + '-color');
    borders.set(side, {
      width,
      style,
      color
    });
  });
  return borders;
};
module.exports = BorderDetailsComponent;
