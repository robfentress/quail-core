/**
 * Wrapper library for DOM operations.
 */

const DataSet = require('data-set');
const documentOffset = require('document-offset');
const isDom = require('is-dom');
const select = require('dom-select');

let _isDomError = (methodName) => {
  throw new Error('Non-DOM object passed to the method DOM.' + methodName);
};

let _assertIsDom = (element, methodName) => {
  let isObjectNode = (
    (typeof element === 'function') &&
    (element.nodeName === 'OBJECT')
  );
  if (
    !element ||
    !isDom(element) &&
    !isObjectNode
  ) {
    _isDomError(methodName);
  }
};

let DOM = {
  scry: (selector, context) => {
    var elements = [];
    if (Array.isArray(context)) {
      context.forEach((ct) => {
        ct && _assertIsDom(ct, 'scry');
        elements = elements.concat(
          select.all(selector, ct)
        );
      });
    }
    else {
      context && _assertIsDom(context, 'scry');
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
  children: (element) => {
    _assertIsDom(element, 'children');
    return Array.prototype.slice.call(element.children);
  },
  hasAttribute: (element, attrName) => {
    _assertIsDom(element, 'hasAttribute');
    return typeof element[attrName] !== 'undefined';
  },
  /**
   * Sets attributes on a node.
   */
  setAttributes: function (element, attributes) {
    _assertIsDom(element, 'setAttributes');
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
    _assertIsDom(element, 'getAttribute');
    return element.getAttribute(name);
  },
  getStyle: (element, name) => {
    _assertIsDom(element, 'getStyle');
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
    _assertIsDom(element, 'getComputedStyle');
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
    _assertIsDom(element, 'next');
    var parentElement = element.parentElement;
    var children;
    var index;
    if (parentElement) {
      children = DOM.children(parentElement);
      index = children.indexOf(element);
    }
    if (index > -1 && index <= (children.length - 2)) {
      return children[index + 1];
    }
  },
  prev: (element) => {
    _assertIsDom(element, 'prev');
    var parentElement = element.parentElement;
    var children;
    var index;
    if (parentElement) {
      children = DOM.children(parentElement);
      index = children.indexOf(element);
    }
    if (index > 0) {
      return children[index - 1];
    }
  },
  nextAll: (element) => {
    _assertIsDom(element, 'nextAll');
    var parentElement = element.parentElement;
    var children;
    var index;
    if (parentElement) {
      children = DOM.children(parentElement);
      index = children.indexOf(element);
    }
    return children.slice(index + 1);
  },
  prevAll: (element) => {
    _assertIsDom(element, 'prevAll');
    var parentElement = element.parentElement;
    var children;
    var index;
    if (parentElement) {
      children = DOM.children(parentElement);
      index = children.indexOf(element);
    }
    return children.slice(0, index);
  },
  is: (element, nodeName) => {
    _assertIsDom(element, 'is');
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
    _assertIsDom(element, 'setData');
    var dataKey = 'data-' + key;
    var attrs = [];
    attrs[dataKey] = value
    DOM.setAttributes(element, attrs);
    DataSet(element);
  },
  getData: (element, key) => {
    _assertIsDom(element, 'getData');
    return DataSet(element)[key];
  },
  removeData: (element, key) => {
    _assertIsDom(element, 'removeData');
    var dataKey = 'data-' + key;
    element.removeAttribute(dataKey);
    DataSet(element);
  },
  text: (element) => {
    _assertIsDom(element, 'text');
    return element.textContent || element.innerText;
  },
  offset: (element) => {
    _assertIsDom(element, 'offset');
    return documentOffset(element);
  },
  isVisible: (element) => {
    _assertIsDom(element, 'isVisible');
    let display = DOM.getComputedStyle(element, 'display');
    let visibility = DOM.getComputedStyle(element, 'visibility');
    return !(display === 'none') && !(visibility === 'hidden');
  }
};

module.exports = DOM;
