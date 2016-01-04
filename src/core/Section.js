var Technique = require('Technique');
var Test = require('Test');
var Section = (function () {

  /**
   * A Collection of Tests.
   */
  function Section (id, details) {
    return new Section.fn.init(id, details);
  }

  // Prototype object of the Section.
  Section.fn = Section.prototype = {
    constructor: Section,
    init: function (id, details) {
      if (!id) {
        return this;
      }
      this.id = id;
      // Create Technique instances for each technique in this section.
      if (details.techniques && details.techniques.length) {
        for (var i = 0, il = details.techniques.length; i < il; ++i) {
          this.push(Technique(details.techniques[i]));
        }
        return this;
      }
      return this;
    },
    // Setting a length property makes it behave like an array.
    length: 0,
    find: function (testname) {
      for (var i = 0, il = this.length; i < il; ++i) {
        if (this[i].get('name') === testname) {
          return this[i];
        }
      }
      // Return an empty Section for chaining.
      return null;
    },
    set: function (testname, details) {
      for (var i = 0, il = this.length; i < il; ++i) {
        if (this[i].get('name') === testname) {
          this[i].set(details);
          return this[i];
        }
      }
      var test = Test(testname, details);
      this.push(test);
      return test;
    },
    addTechnique: function (technique) {
      // Register for result events on the technique.
      // this.listenTo(technique, 'result', this.regiterTechniqueTestResult);
      this.push(technique);
    },
    regiterTechniqueTestResult: function () {

    },
    forEach: [].forEach,
    push: [].push,
    sort: [].sort,
    splice: [].splice
  };

  // Give the init function the Section prototype.
  Section.fn.init.prototype = Section.fn;

  return Section;
}());
module.exports = Section;
