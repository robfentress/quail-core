#!/usr/bin/env node --harmony

'use strict';

const babelify = require('babelify');
const browserify = require('browserify');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

const cwd = process.cwd();

function runBrowserify (config) {
  // Create the directories.
  let outputPath = path.join(cwd, 'dist');
  let tmpPath = path.join(__dirname, '..', 'tmp');
  let conjoinedAssessmentsFile = path.join(tmpPath, '_Assessments.js');
  let paths = [
    path.join(__dirname, 'core'),
    path.join(__dirname, 'components'),
    path.join(__dirname, 'etc'),
    tmpPath
  ];
  paths = paths.concat((config.requirePaths || []));
  mkdirp(outputPath, function (err) {
    if (err) {
      throw err;
      process.exit(1);
    }
    let _bundle = function (err) {
      if (err) {
        throw err;
        process.exit(1);
      }
      ['dist/runInBrowser.js', 'dist/bundle.js'].forEach(function (filename) {
        let buff = browserify({
          paths: paths,
          options: {
            debug: false
          }
        })
          .on('error', function (err) {
            console.error('Error : ' + err.message);
          })
          .add(path.join(__dirname, 'core/Quail.js'))
          .add(conjoinedAssessmentsFile);
        // Load required modules.
        (config.requireModules || []).forEach(function (mod) {
          buff.require(mod);
        });
        if (filename === 'dist/runInBrowser.js') {
          // Add the module that will output results to the console.
          buff.add(path.join(__dirname, 'etc/runQuailOutputToConsole.js'));
        }
        buff
          .transform(babelify)
          .bundle()
          .pipe(
            fs.createWriteStream(
              path.join(cwd, filename)
            )
          );
      });
    };
    // Create a module file with the required assessments.
    fs.readFile(path.join(cwd, config.requireAssessmentModules[0]), function (err, data) {
      if (err) {
        throw err;
        process.exit(1);
      }
      var assessments = JSON.parse(data);
      var output = ['let map = new Map();'];
      var lowerCaseFirstLetter = function (str) {
        return str.charAt(0).toLowerCase() + str.slice(1);
      };
      assessments.forEach(function (name) {
        output
          .unshift(
            'const ' + name + ' = require(\'' + name + '\');'
          );
        output.push(
            'map.set(\'' + lowerCaseFirstLetter(name) + '\', ' + name + ');'
          );
      });
      output.unshift('\'use strict\';');
      output.push('module.exports = map;');

      // Write out Quail.
      fs.writeFile(
        conjoinedAssessmentsFile,
        output.join('\n'),
        'utf8',
        _bundle
      );
    });
  });
}

module.exports = function buildQuail (config) {
  config = config || {};
  runBrowserify(config);
};
