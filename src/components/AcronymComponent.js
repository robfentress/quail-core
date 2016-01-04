const Case = require('Case');
const DOM = require('DOM');
var AcronymComponent = function (test) {
  test.get('scope').forEach(function (scope) {
    var alreadyReported = {};
    var predefined = {};

    // Find defined acronyms within this scope.
    DOM.scry('acronym[title], abbr[title]', scope).forEach(function (element) {
      predefined[
        element.innerText
          .trim()
          .replace(/\n/g, '')
          .replace(/( ){2,}/g, ' ')
          .toUpperCase()
      ] = element.getAttribute('title');
    });

    // Consider all block-level html elements that contain text.
    DOM.scry('p, span, h1, h2, h3, h4, h5', scope).forEach(function (element) {
      var self = element;
      var text = self.innerText;
      var words = text.split(' ');
      // Keep a list of words that might be acronyms.
      var infractions = [];
      // If there is more than one word and ??.
      if (words.length > 1 && text.toUpperCase() !== text) {
        // Check each word.
        words.forEach(function (word) {
          // Only consider words great than one character.
          if (word.length < 2) {
            return;
          }
          // Only consider words that have not been predefined.
          // Remove any non-alpha characters.
          word = word.replace(/[^a-zA-Zs]/, '');
          // If this is an uppercase word that has not been defined, it fails.
          if (word.toUpperCase() === word && typeof predefined[word.toUpperCase().trim()] === 'undefined') {
            if (typeof alreadyReported[word.toUpperCase()] === 'undefined') {
              infractions.push(word);
            }
            alreadyReported[word.toUpperCase()] = word;
          }
        });
        // If undefined acronyms are discovered, fail this case.
        if (infractions.length) {
          test.add(Case({
            element: self,
            info: {
              acronyms: infractions
            },
            status: 'failed'
          }));
        }
        else {
          test.add(Case({
            element: self,
            status: 'passed'
          }));
        }
      }
      else {
        test.add(Case({
          element: self,
          status: 'passed'
        }));
      }
    });
  });
};
module.exports = AcronymComponent;
