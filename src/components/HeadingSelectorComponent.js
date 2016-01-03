const DOM = require('DOM');

const selector = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6'
].join(', ');

const HeadingSelectorComponent = (context) => DOM.scry(selector, context);

module.exports = HeadingSelectorComponent;
