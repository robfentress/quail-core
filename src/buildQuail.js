const babelify = require('babelify');
const browserify = require('browserify');
const fs = require('fs');
const glob = require('glob');
const mkdirp = require('mkdirp');
const path = require('path');

const cwd = process.cwd();

function runBrowserify () {
  mkdirp(path.join(cwd, 'dist'), function (err) {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    else {
      browserify({
        paths: [
          path.join(__dirname, 'core'),
          path.join(__dirname, 'component')
        ],
        options: {
          debug: false
        }
      })
        .add(path.join(__dirname, 'core/Quail.js'))
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
    }
  });
}

module.exports = function buildQuail (config) {
  runBrowserify();
};
