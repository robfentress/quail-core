/**
 * @providesModule Quail
 */

'use strict';

require('babel-polyfill/dist/polyfill');

var globalQuail = window.globalQuail || {};

const TestCollection = require('TestCollection');
const wcag2 = require('wcag2');
const _Assessments = require('_Assessments');

var Quail = {

  guidelines: {
    wcag: {
      /**
       * Perform WCAG specific setup.
       */
      setup: function (tests, listener, callbacks) {
        callbacks = callbacks || {};
        // Associate Success Criteria with the TestCollection.
        for (var sc in this.successCriteria) {
          if (this.successCriteria.hasOwnProperty(sc)) {
            var criteria = this.successCriteria[sc];
            criteria.registerTests(tests);
            if (listener && listener.listenTo && typeof listener.listenTo === 'function') {
              // Allow the invoker to listen to successCriteriaEvaluated events
              // on each SuccessCriteria.
              if (callbacks.successCriteriaEvaluated) {
                listener.listenTo(criteria, 'successCriteriaEvaluated', callbacks.successCriteriaEvaluated);
              }
            }
          }
        }
      },
      successCriteria: {}
    }
  },

  /**
   * Main run function for Quail.
   */
  run: function (options) {
    function buildTests (assessmentList, options) {
      // Create an empty TestCollection.
      let testCollection = TestCollection([], {
        scope: options.scope || document
      });
      let assessmentsToRun = new Set(
        assessmentList || _Assessments.keys()
      );
      for (let name of assessmentsToRun) {
        let mod = _Assessments.get(name);
        if (mod) {
          testCollection.set(name, {
            scope: options.scope || document,
            callback: mod.run,
            ...mod.meta
          });
        }
      }
      return testCollection;
    }

    /**
     * A private, internal run function.
     *
     * This function is called when the tests are collected, which might occur
     * after an AJAX request for a test JSON file.
     */
    function _run (assessments) {
      // Set up Guideline-specific behaviors.
      var noop = function () {};
      for (var guideline in Quail.guidelines) {
        if (Quail.guidelines[guideline] && typeof Quail.guidelines[guideline].setup === 'function') {
          Quail.guidelines[guideline].setup(assessments, this, {
            successCriteriaEvaluated: options.successCriteriaEvaluated || noop
          });
        }
      }

      // Invoke all the registered tests.
      assessments.run({
        preFilter: options.preFilter || function () {},
        caseResolve: options.caseResolve || function () {},
        testComplete: options.testComplete || function () {},
        testCollectionComplete: options.testCollectionComplete || function () {},
        complete: options.complete || function () {}
      });
    }

    // Let wcag2 run itself, will call Quail again when it knows what
    // to
    if (options.guideline === 'wcag2') {
      wcag2.run(options);
    }
    else {
      // If a list of specific tests is provided, use them.
      _run(
        buildTests(options.assessments, options)
      );
    }
  },

  // @todo, make this a set of methods that all classes extend.
  listenTo: function (dispatcher, eventName, handler) {
    handler = handler.bind(this);
    dispatcher.registerListener.call(dispatcher, eventName, handler);
  },

  getConfiguration: function (testName) {
    var test = this.tests.find(testName);
    var guidelines = test && test.get('guidelines');
    var guideline = guidelines && this.options.guidelineName && guidelines[this.options.guidelineName];
    var configuration = guideline && guideline.configuration;
    if (configuration) {
      return configuration;
    }
    return false;
  }
};

globalQuail.run = globalQuail.run || function (...args) {
  Quail.run(...args);
}

window.globalQuail = globalQuail;

module.exports = Quail;
