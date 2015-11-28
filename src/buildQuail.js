#!/usr/bin/env node --harmony

'use strict';

const babelify = require('babelify');
const browserify = require('browserify');
const fs = require('fs');
const glob = require('glob');
const mkdirp = require('mkdirp');
const path = require('path');

const cwd = process.cwd();

function runBrowserify (config) {
  // Create the directories.
  let outputPath = path.join(cwd, 'dist');
  let tmpPath = path.join(__dirname, '..', 'tmp');
  let conjoinedAssessmentsFile = path.join(tmpPath, '_Assessments.js');
  let conjoinedAssessmentsModule = path.join(tmpPath, '_Assessments');
  let paths = [
    path.join(__dirname, 'core'),
    path.join(__dirname, 'components'),
    path.join(__dirname, 'build'),
    tmpPath,
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
      let buff = browserify({
        paths: paths,
        options: {
          debug: false
        }
      }).add(path.join(__dirname, 'core/Quail.js'));
      // Load required modules.
      (config.requireModules || []).forEach(function (mod) {
        buff.require(mod);
      });
      // Add the module that will output results to the console.
      buff.add(path.join(__dirname, 'build/runQuailOutputToConsole.js'));
      // Load the assessments.
      buff.add(conjoinedAssessmentsFile);
      // Babelify and write out the file.
      buff
        .transform(babelify)
        .bundle()
        .on('error', function (err) {
          console.log('Error : ' + err.message);
        })
        .pipe(
          fs.createWriteStream(
            path.join(cwd, 'dist/runInBrowser.js')
          )
        );
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
