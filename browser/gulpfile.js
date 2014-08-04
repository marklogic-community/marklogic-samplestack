/*!
 * TODO -- this is outdated
 * gulpfile.js for MarkLogic web app
 *
 * All of the actual functionality is in GulpWorker.  This is done
 * so that this repository can be used as a part of a larger project.
 * The larger project would use the GulpWorker without this gulpfile,
 * thus allowing it own the tasks themselves and their names, in order to:
 *
 * (a) avoid name collisions
 * (b) combine functionality from this repo with that of another (others).
 *
 * Any changes to the build process for this repo are thus to be made in
 * GulpWorker.js.
 */

var gulp = require('gulp');
var _ = require('lodash');
var tasks = require('./dev-tasks/tasks');
var log = require('gulp-util').log;
var chalk = require('chalk');

// gulp.addListener('err', function(e) {
//   console.log(e.err.stack);
// });

_.forEach(tasks, function(task, taskName) {
  gulp.task(taskName, task.deps, task.func);
});

// monkey-patch console.log to suppress unremarkables
var unremarkablesExpr;
// var unremarkables = _.reduce(tasks,
//   function(result, task, taskName) {
//     if (task.unremarkable) {
//       result.push('\'' + taskName + '\'');
//     }
//     return result;
//   },
//   []
// );
var unremarkables = ['watch'];
if (unremarkables.length) {
  unremarkablesExpr = new RegExp(unremarkables.join('|'));
}

var cl = console.log;
/**
 * TODO
 * @return {[type]} [description]
 */
console.log = function() {
  var args = Array.prototype.slice.call(arguments);
  if (args.length > 1 && (args[1] === 'Starting' || args[1] === 'Finished') &&
      unremarkablesExpr &&
      unremarkablesExpr.test(chalk.stripColor(args[2])))
  {
    return;
  }
  if (args.length > 1 && (args[1] === 'silent mode: test failed')) {
    return;
  }
  return cl.apply(console, args);
};
