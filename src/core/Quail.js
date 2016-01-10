/**
 * @providesModule quail
 */

'use strict';

require('babel-polyfill/dist/polyfill');

var globalQuail = window.globalQuail || {};

const TestCollection = require('TestCollection');
const _Assessments = require('_Assessments');

var quail = {

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
   * Main run function for quail.
   */
  run: function (options) {
    function buildTests (assessmentList) {
      // Create an empty TestCollection.
      var testCollection = TestCollection([], {
        scope: options.html || document
      });

      for (var i = 0, il = assessmentList.length; i < il; ++i) {
        let name = assessmentList[i];
        let mod = _Assessments.get(name);
        if (mod) {
          testCollection.set(name, {
            scope: options.html || null,
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
    function _run (testCollection) {
      // Set up Guideline-specific behaviors.
      // var noop = function () {};
      // for (var guideline in quail.guidelines) {
      //   if (quail.guidelines[guideline] && typeof quail.guidelines[guideline].setup === 'function') {
      //     quail.guidelines[guideline].setup(testCollection, this, {
      //       successCriteriaEvaluated: options.successCriteriaEvaluated || noop
      //     });
      //   }
      // }

      // Invoke all the registered tests.
      testCollection.run({
        preFilter: options.preFilter || function () {},
        caseResolve: options.caseResolve || function () {},
        testComplete: options.testComplete || function () {},
        testCollectionComplete: options.testCollectionComplete || function () {},
        complete: options.complete || function () {}
      });
    }

    // Let wcag2 run itself, will call quail again when it knows what
    // to
    // if (options.guideline === 'wcag2') {
    //   wcag2.run(options);
    // }

    // If a list of specific tests is provided, use them.
    var aTests = buildTests(options.accessibilityTests);
    _run.call(aTests);
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
  quail.run(...args);
}

window.globalQuail = globalQuail;

module.exports = quail;
