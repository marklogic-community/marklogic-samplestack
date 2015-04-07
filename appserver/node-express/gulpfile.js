/* 
 * Copyright 2012-2015 MarkLogic Corporation 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */ 

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
var tasks = require('./dev-tasks');

gulp.on('err', function (e) {
  console.log(e.err.stack);
});

var consoleLogOrig = console.log;

var ctx = require('./dev-tasks/context');

// expression to test for task names whose starting and ending log messages
// we wish to suppress
var taskNoLogExpr = new RegExp([
  'watch'
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
  if (noLogTask(arguments)) {
    return;
  }
  if (arguments[1] && arguments[1].match(/Using gulpfile/)) {
    return;
  }
  consoleLogOrig.apply(console, arguments);
};

// loop the tasks and assign them into the gulp process
var taskName;
for (taskName in tasks) {
  gulp.task(taskName, tasks[taskName].deps, tasks[taskName].func);
}

if (!ctx.isChildProcess()) {
  gulp.seq = [];
  gulp._resetAllTasks();
  gulp.reset();
  gulp.task(ctx.currentTask(), function () {
    ctx.restartChild();
  });
}
