var IsUnreadable = require('IsUnreadable');
const ContainsReadableTextComponent = function (element, children) {
  element = element.clone();
  DOM.scry('option', element).remove();
  if (!IsUnreadable(element.text())) {
    return true;
  }
  if (!IsUnreadable(element.attr('alt'))) {
    return true;
  }
  if (children) {
    var readable = false;
    DOM.scry('*', element).each(function () {
      if (ContainsReadableTextComponent($(this), true)) {
        readable = true;
      }
    });
    if (readable) {
      return true;
    }
  }
  return false;
}

module.exports = ContainsReadableTextComponent;
