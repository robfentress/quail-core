// Karma configuration for Quail unit tests

const babelify = require('babelify');

module.exports = function(karma) {
  karma.set({

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [
      'browserify',
      'mocha',
      'chai',
      'sinon'
    ],

    // list of files / patterns to load in the browser
    files: [
      'test/core/*Spec.js'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/core/*.js': [
        'browserify'
      ],
      'src/components/*.js': [
        'browserify'
      ],
      'test/**/*.js': [
        'browserify'
      ]
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec'],

    // the default configuration
    htmlReporter: {
      outputDir: 'karma_html',
      templatePath: __dirname + '/node_modules/karma-html-reporter/jasmine_template.html'
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: karma.LOG_DISABLE || karma.LOG_ERROR || karma.LOG_WARN || karma.LOG_INFO || karma.LOG_DEBUG
    logLevel: karma.LOG_INFO,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      // 'Chrome',
      // 'IE',
      // 'Safari',
      'Firefox',
      // 'Opera',
      'PhantomJS'
    ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
    autoWatch: false,

    browserify: {
      paths: [
        'node_modules/',
        'src/core/',
        'test/__mocks__/'
      ],
      debug: true,
      configure: function(bundle) {
        bundle.once('prebundle', function() {
          bundle.transform(babelify);
        });
      }
    }
  });
};
