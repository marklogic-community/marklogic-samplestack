/**
 * This gulpfile module:
 *
 * * monkey-patches the console to clean it up a bit.
 * * assigns the tasks which are defined in dev-tasks into the gulp
 * process.
 *
 * The gulpfile does not export anythying, it only has side-effects.
 *
 * All of the actual gulp-based functionality is in the
 * {@link dev-tasks dev-tasks module}.
 *
 * @module browser/gulpfile
 * @see {dev-tasks}
 */

var gulp = require('gulp');
var chalk = require('chalk');
var tasks = require('./shared/js/dev-tasks');

var consoleLogOrig = console.log;

var ctx = require('./shared/js/dev-tasks/context');

// expression to test for task names whose starting and ending log messages
// we wish to suppress
var taskNoLogExpr = new RegExp([
  'watch', 'e2e'
].join('|'));

/**
 * Returns true if a call to task's console.log should is to be suppressed.
 * @param {Array} logArgs The arguments passed to console.log.
 */
var noLogTask = function (logArgs) {
  return logArgs.length > 1 &&
      (logArgs[1] === 'Starting' || logArgs[1] === 'Finished') &&
      taskNoLogExpr.test(chalk.stripColor(logArgs[2]));
};

/**
 * Mokey-patched version of console.log that suppresses log messages which
 * are superfluous or distracting for the developer. Gulp developers assure
 * that the next version of gulp will have a cleaner way to manage logging.
 */
console.log = function () {
  var args = Array.prototype.slice.call(arguments);
  if (noLogTask(args)) {
    return;
  }
  if (args[1] && args[1].match(/Using gulpfile/)) {
    return;
  }
  consoleLogOrig.apply(console, args);
};

// loop the tasks and assign them into the gulp process
var taskName;
for (taskName in tasks) {
  gulp.task(taskName, tasks[taskName].deps, tasks[taskName].func);
}

if (!ctx.parentPid() && ctx.currentTask === 'watch') {
  gulp.seq = [];
  gulp._resetAllTasks();
  gulp.reset();
  gulp.task(ctx.currentTask, function () {
    ctx.restartChild();
  });
}

process.on('exit', function() {
  if ( ctx.hadErrors ) {
    process.exit(1);
  }
});
