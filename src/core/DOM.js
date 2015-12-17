/**
 * Wrapper library for DOM operations.
 */

const select = require('dom-select');

let DOM = {
  scry: (selector, context) => {
    context = context || document;
    return select.all(selector, context);
  }
};

module.exports = DOM;
