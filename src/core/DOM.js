/**
 * Wrapper library for DOM operations.
 */

const DataSet = require('data-set');
const isDom = require('is-dom');
const select = require('dom-select');

let _isDomError = (methodName) => {
  throw new Error('Non-DOM object passed to the method DOM.' + methodName);
};

let DOM = {
  scry: (selector, context) => {
    var elements = [];
    if (Array.isArray(context)) {
      context.forEach((ct) => {
        if (ct && !isDom(ct)) {
          _isDomError('scry');
        }
        elements = elements.concat(
          select.all(selector, ct)
        );
      });
    }
    else {
      if (context && !isDom(context)) {
        _isDomError('scry');
      }
      elements = elements.concat(
        select.all(selector, context)
      );
    }
    return elements;
  },
  parents: (element) => {
    let parentNodes = [];
    let node = element;
    while (node.parentNode) {
      parentNodes.push(node.parentNode);
      node = node.parentNode;
    }
    return parentNodes;
  },
  hasAttribute: (element, attrName) => {
    if (!isDom(element)) {
      _isDomError('hasAttribute');
    }
    return typeof element[attrName] !== 'undefined';
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
        continue; // The type attribute needs to be set first in IE.
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
  getAttribute: (element, name) => {
    if (!isDom(element)) {
      _isDomError('getAttribute');
    }
    return element.getAttribute(name);
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
    var elementNodeName = element.nodeName.toLowerCase();
    var names;
    if (typeof nodeName === 'string') {
      names = nodeName.split(/, ?/);
    }
    else {
      // Assume it is an Array. Promptly shoot self in foot.
      names = nodeName;
    }
    names = names.map((name) => name.toLowerCase());
    var expandedNames = [];
    // Expand colon-prefixed selectors to sets of selectors.
    names.forEach((name) => {
      switch (name) {
      case ':input':
        expandedNames = expandedNames.concat([
          'input',
          'button',
          'select',
          'textarea'
        ]);
        break;
      default:
        expandedNames.push(name);
      }
    });
    return expandedNames.indexOf(elementNodeName) > -1;
  },
  setData: (element, key, value) => {
    if (!isDom(element)) {
      _isDomError('setData');
    }
    var dataKey = 'data-' + key;
    var attrs = [];
    attrs[dataKey] = value
    this.setAttributes(element, attrs);
    DataSet(element);
  },
  getData: (element, key) => {
    if (!isDom(element)) {
      _isDomError('getData');
    }
    return DataSet(element)[key];
  },
  removeData: (element, key) => {
    if (!isDom(element)) {
      _isDomError('removeData');
    }
    var dataKey = 'data-' + key;
    element.removeAttribute(dataKey);
    DataSet(element);
  },
  text: (element) => {
    if (!isDom(element)) {
      _isDomError('text');
    }
    return element.textContent || element.innerText;
  }
};

module.exports = DOM;
