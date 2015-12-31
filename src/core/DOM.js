/**
 * Wrapper library for DOM operations.
 */

const select = require('dom-select');

let DOM = {
  scry: (selector, context) => {
    context = context || document;
    return select.all(selector, context);
  },
  /**
   * Sets attributes on a node.
   */
  setAttributes: function (element, attributes) {
    // The type attribute needs to be set first in IE, so we special case it.
    if (attributes.type) {
      element.type = attributes.type;
    }

    for (var attribute in attributes) {
      var value = attributes[attribute];

      if (attribute == 'type') {
        continue; // The type attribute needs to be set first in IE. See above.
      }
      else if (attribute == 'style') {
        if (typeof value == 'string') {
          element.style.cssText = value;
        }
        else {
          Object.assign(element.style, value);
        }
      }
      else if (attribute in element) {
        element[attribute] = value;
      }
      else if (element.setAttribute) {
        element.setAttribute(attribute, value);
      }
    }
  },
  getStyle: (element, name) => {
    var value;
    try {
      value = element.style[name];
    }
    catch (error) {
      throw new Error(error);
    }
    return value;
  },
  getComputedStyle: (element, name) => {
    var value;
    try {
      value = window.getComputedStyle(element).getPropertyValue(name);
    }
    catch (error) {
      throw new Error(error);
    }
    return value;
  },
  next: (element) => {
    var parentNode = element.parentNode;
    var childNodes;
    var index;
    if (parentNode) {
      childNodes = parentNode.childNodes;
      index = Array.prototype.indexOf.call(childNodes, element);
    }
    if (index > -1 && index < (childNodes.length - 2)) {
      return childNodes[index + 1];
    }
  },
  prev: (element) => {
    var parentNode = element.parentNode;
    var childNodes;
    var index;
    if (parentNode) {
      childNodes = parentNode.childNodes;
      index = Array.prototype.indexOf.call(childNodes, element);
    }
    if (index > 0) {
      return childNodes[index - 1];
    }
  }
};

module.exports = DOM;
