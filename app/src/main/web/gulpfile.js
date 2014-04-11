var gulp = require('gulp');
var es = require('event-stream');
var runSequence = require('run-sequence');
var path = require('path');
var gutil = require('gulp-util');
var chalk = require('chalk');
var $ = require('gulp-load-plugins')({lazy: false});

var webPort = 8080;
var stackRoot = path.resolve(process.cwd() + '../../../..');
var pubDir = path.resolve(stackRoot + '/public');
var pubGlob = pubDir + '/**/*';
console.log(pubGlob);


function sayPrompt() {
  /* jshint -W101 */
  var msg =
      '\n***********************************\n' +
      chalk.magenta('watching for code changes\n') +
      chalk.bold.red('...press a key:\n') +
      '***********************************\n' +
      chalk.bold('[ctrl+o]') + ': ' + chalk.green('open') + ' app in default ' + chalk.green('web browser') + ' -- ' + chalk.bold('LiveReload enabled\n') +
      chalk.bold('[enter]') + ': run ' + chalk.green('unit') + ' tests\n' +
      chalk.bold('[space]') + ': run ' + chalk.green('integration') + ' tests\n' +
      chalk.bold('[ctrl+c]') + ': ' + chalk.red('exit') + '\n';
  /* jshint +W101 */

  console.log(msg);
}

function onKeypress(ch, key) {
  process.stdin.pause();
  process.stdin.removeListener('keypress', onKeypress);
  var action;
  try {
    switch (key.name) {
      case 'space':
        action = 'unit';
        break;
      case 'return':
        action = 'integration';
        break;
      case 'c':
        if (key.ctrl) {
          action = 'quit';
        }
        break;
      case 'o':
        if (key.ctrl) {
          action = 'open';
        }
        break;
      default:
        break;
    }
  }
  catch (err) {}

  var i;
  if (action === 'unit') {
    for (i = 0; i < 10; i++) {
      console.log(chalk.yellow('let\'s pretend unit tests just ran'));
    }
  }

  if (action === 'integration') {
    for (i = 0; i < 10; i++) {
      console.log(chalk.yellow('let\'s pretend integration tests just ran'));
    }
  }

  if (action === 'open') {
    require('open')({url: 'http://localhost:8080/'});
  }

  if (action === 'quit') {
    console.log(chalk.green('bye bye!!!\n'));
    process.exit();
    return;
  }


  sayPrompt();
  process.stdin.on('keypress', onKeypress);
  process.stdin.resume();
}

function startPrompting() {
  require('keypress')(process.stdin);
  // process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('keypress', onKeypress);
  sayPrompt();
}


gulp.task('clean', function() {
  return gulp.src(pubGlob)
      .pipe($.clean({force: true, read: false}));
});

function copy() {
  return es.merge(
      gulp.src(['src/**/*', '!src/index.html'])
          .pipe($.cached('copyMost'))
          .pipe(gulp.dest(pubDir)),
      gulp.src('src/index.html')
          .pipe($.cached('copyIndex'))
          .pipe($.embedlr())
  )
      .pipe(gulp.dest(pubDir));
}

gulp.task('build', function() {
  return copy();
});


// function tinylr() {
//   tinylr.server.changed();
// }

// tinylr.listen = function(port, cb) {
//   if (!port) {
//     port = 35729;
//   }
//   tinylr.port = port;
//   tinylr.server = new (require('tiny-lr').Server)();
//   tinylr.server.listen(port, function(err) {
//     if (err) {
//       throw new gutil.PluginError('tiny-lr', err.message);
//     }
//     cb();
//   });
// };



gulp.task('watch', function(done) {
  // Watch for changes in `src` folder
  gulp.watch(['src/**/*'], function(evt) {
    copy();
  });

  var server = $.livereload();

  gulp.watch(pubGlob, function(evt) {
    server.changed(evt.path);
  });
  setTimeout(function() {
    done();
  }, 1000);

  // tinylr.listen(null, function() {
  //   gulp.watch(pubGlob, function(evt) {
  //     tinylr({body: {files: []}});
  //   });
  //   var message = 'LiveReload server listening on port ' + tinylr.port;
  //   gutil.log(gutil.colors.green(message));
  //   done();
  // });
});

gulp.task('default', function(callback) {
  runSequence('clean', 'build', 'watch', function() {
    setTimeout(startPrompting, 1500);
    setTimeout(function() {
      var msg = 'The web server is probably now listening on: ';
      console.log(msg + chalk.magenta(webPort + '\n'));
      // there is no way to use a named window, rendering this
      // worse than useless
      // require('open')('http://localhost:8080/');
    }, 2500);
    callback();
  });
});
