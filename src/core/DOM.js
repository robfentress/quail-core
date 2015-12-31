/**
 * Wrapper library for DOM operations.
 */

const isDom = require('is-dom');
const select = require('dom-select');

let _isDomError = (methodName) => {
  throw new Error('Non-DOM object passed to the method DOM.' + methodName);
};

let DOM = {
  scry: (selector, context) => {
    context = context || document;
    return select.all(selector, context);
  },
  /**
   * Sets attributes on a node.
   */
  setAttributes: function (element, attributes) {
    if (!isDom(element)) {
      _isDomError('setAttributes');
    }
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
    if (!isDom(element)) {
      _isDomError('getStyle');
    }
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
    if (!isDom(element)) {
      _isDomError('getComputedStyle');
    }
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
    if (!isDom(element)) {
      _isDomError('next');
    }
    var parentElement = element.parentElement;
    var children;
    var index;
    if (parentElement) {
      children = parentElement.children;
      index = Array.prototype.indexOf.call(children, element);
    }
    if (index > -1 && index <= (children.length - 2)) {
      return children[index + 1];
    }
  },
  prev: (element) => {
    if (!isDom(element)) {
      _isDomError('prev');
    }
    var parentElement = element.parentElement;
    var children;
    var index;
    if (parentElement) {
      children = parentElement.children;
      index = Array.prototype.indexOf.call(children, element);
    }
    if (index > 0) {
      return children[index - 1];
    }
  },
  is: (element, nodeName) => {
    if (!isDom(element)) {
      _isDomError('is');
    }
    var names;
    if (typeof nodeName === 'string') {
      names = nodeName.split(/, ?/);
    }
    else {
      names = nodeName;
    }
    var elementNodeName = element.nodeName.toLowerCase();
    return names.some((name) => {
      return name.toLowerCase() === elementNodeName;
    });
  }
};

module.exports = DOM;
