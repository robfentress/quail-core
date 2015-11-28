const babelify = require('babelify');
const browserify = require('browserify');
const fs = require('fs');
const glob = require('glob');
const mkdirp = require('mkdirp');
const path = require('path');
const quailDevelopmentFilesPath = __dirname + '/../src/development/**/*.js';

const cwd = process.cwd();

function browserify () {
  glob(quailDevelopmentFilesPath, function (error, developmentFiles) {
    if (error) {
      process.exit(1);
    }
    mkdirp('dist', function (err) {
      if (err) {
        console.log(err);
      }
      else {
        browserify({
          entries: developmentFiles,
          paths: [
            './config/',
            './src/core/',
            './src/core/lib',
            './src/js/',
            './src/js/components/',
            './src/js/strings/',
            './src/assessments/',
            './vendor/',
          ],
          options: {
            debug: false
          }
        })
          .add('./config/AllTests.js')
          .transform(babelify)
          .bundle()
          .on('error', function (err) {
            console.log('Error : ' + err.message);
          })
          .pipe(fs.createWriteStream('dist/runInBrowser.js'));
      }
    });
  });
}

module.exports = function buildQuail (config) {

};
