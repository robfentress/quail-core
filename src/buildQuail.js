const babelify = require('babelify');
const browserify = require('browserify');
const fs = require('fs');
const glob = require('glob');
const mkdirp = require('mkdirp');
const path = require('path');

const cwd = process.cwd();

function runBrowserify (config) {
  mkdirp(path.join(cwd, 'dist'), function (err) {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    var paths = [
      path.join(__dirname, 'core'),
      path.join(__dirname, 'components'),
      path.join(__dirname, 'build'),
    ];

    paths = paths.concat((config.requirePaths || []));

    var buff = browserify({
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
    buff.add(path.join(__dirname, 'build/runQuailOutputToConsole'));
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
  });
}

module.exports = function buildQuail (config) {
  config = config || {};
  runBrowserify(config);
};
