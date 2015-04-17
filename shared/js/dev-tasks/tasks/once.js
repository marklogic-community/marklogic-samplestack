var cp = require('child_process');
var path = require('path');
var chalk = require('chalk');

module.exports = [
  {
    name: 'once',
    deps: [],
    func: function (cb) {
      var browserFlag = '--browser=';
      var argv = require('yargs').argv;
      if (argv.browser) {
        browserFlag += argv.browser;
      }
      else {
        browserFlag += 'chrome';
      }

      var child = cp.fork(
        path.resolve(
          __dirname, '../../../../node_modules/gulp/bin/gulp.js'
        ),
        ['e2e', '--middle-tier=java', browserFlag],
        { stdio: 'inherit' }
      );

      var done = false;
      var onDone =  function (err) {
        if (!done) {
          done = true;
          if (err) {
            console.log(chalk.red('\nError(s) occurred.'));
            console.log(
              chalk.yellow(
                'The Samplestack environment may not be properly configured.'
              )
            );
            return cb(err);
          }
          console.log(chalk.green('\nSamplestack configuration OK!'));
          return cb();
        }
      };

      child.on('exit', onDone);
      child.on('exit', onDone);
      child.on('close', onDone);
    }
  }
];
