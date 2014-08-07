/*
*****************************************************
*****************************************************
*****************************************************
*****************************************************
*****************************************************
*****************************************************

due to ongoing updates to gulp related to consistently
using the new node streams api:

gulp-filter is pegged in pacakge.json at 0.4.1.

0.5.0 of the library breaks things badly

through2 breaks the build at 0.5.1, pinned to 0.4.2

will sort out when the gulp dust settles
*****************************************************
*****************************************************
*****************************************************
*****************************************************
*****************************************************
*****************************************************
 */


var mochaReporter = 'dot';
var tasks = module.exports = {};

var path = require('path');
var _ = require('lodash');
var fs = require('fs');
var chalk = require('chalk');
var gulp = require('gulp');
var merge = require('event-stream').merge;
var readArray = require('event-stream').readArray;
var globule = require('globule');
var lazypipe = require('lazypipe');

var childProcess = require('child_process');
var winExt = /^win/.test(process.platform) ? '.cmd' : '';

var h = require('./helper');
var buildParams = require('../buildParams');

// make it easier to get to plugins
var $ = h.$;

var buildsRoot = path.join(h.rootDir, 'builds');
var buildDir = path.join(h.rootDir, h.targets.build);
var unitDir = path.join(h.rootDir, h.targets.unit);
var distDir = path.join(h.rootDir, h.targets.dist);
var srcDir = path.join(h.rootDir, h.src);
var unitSrcDir = path.join(h.rootDir, h.unitSrc);

var bootstrapDir =
    'bower_components/bootstrap-sass-official/assets/stylesheets';


/**************************
stuff about dealing with
watch having to be restarted
**************************/
var amWatching = false;
var activeServers;
var rebuildOnNext = false;

function closeActiveServers () {
  var serverKey;
  for (serverKey in activeServers) {
    var server = activeServers[serverKey];
    try {
      server.close();
    } catch (err) {
      console.log(err.toString());
    }
    delete activeServers[serverKey];
  }
}

function setActiveServer (key, server) {
  // console.log('activated: ' + key);
  if (!activeServers) {
    activeServers = {};
  }
  activeServers[key.toString()] = server;
}
function getActiveServer (key) {
  return activeServers && activeServers[key.toString()];
}

function refireWatchTask (servers) {
  closeActiveServers();
  rebuildOnNext = false;
  gulp.start('watch');
}

function refireWatchFunc () {
  if (amWatching) {
    amWatching = false;
    $.util.log('[' + chalk.cyan('watch') + '] ' +
        chalk.yellow(
          'restarting watch'
        ));
    closeActiveServers();
    rebuildOnNext = true;
    tasks['watch'].func();
  }
}

var hadErrors = false;
function trim (str) { return str.replace(/^\s+|\s+$/g, ''); }
var plumberErrorHandler = function (err) {
  hadErrors = true;
  $.util.log(
    $.util.colors.red('[plumber]: error from plugin:\n\n') +
    trim(err.toString()) + '\n'
  );
  if (watchTaskCalled && !rebuildOnNext) {
    $.util.log('[' + chalk.cyan('watch') + '] ' +
        chalk.yellow(
          'a full rebuild will be scheduled on next change'
        ));
    rebuildOnNext = true;
  }
};

/********************
tasks
********************/

// TODO: !**/*.md is not protecting markdown files from being deleted!!!
// del bug?
tasks.clean = {
  deps: [],
  func: function (cb) {
    require('del')([
      path.join(buildsRoot, 'built', '**/*'),
      path.join(buildsRoot, 'unit-tester', '**/*'),
      path.join(distDir, '**/*'),
      '!**/README.md' // leave any markdown docs, they're there for a reason
    ], cb);
  }
};

var bowerFiles = require('main-bower-files');
var bowerBuildStream = function (read) {
  return h.fs.src(bowerFiles({
    includeDev: false,
    // debugging: true,
    dependencies: false,
    read: read
  }), { base: path.join(h.rootDir, 'bower_components') });


};

var bowerUnitStream = function (read) {
  return h.fs.src(bowerFiles({
    includeDev: true,
    // debugging: true,
    dependencies: false,
    read: read
  }), { base: path.join(h.rootDir, 'bower_components') });
};

// copy all of the bower components runtime deps to the build
// and unit targets.
// also, for unit targets, copy the dev dependencies that have
// an oerride that indicates they are needed for the unit target
//
tasks['bower-files'] = {
  deps: ['clean'],
  func: function () {
    var stream1 = bowerBuildStream(true)
      .pipe(h.fs.dest(path.join(buildDir, 'deps')));

    var stream2 = bowerUnitStream(true)
      .pipe(h.fs.dest(path.join(unitDir, 'deps')));

    return merge(stream1, stream2);
  }
};

var indexHtmlStream = function (stream, target) {
  var filt = $.filter(
    path.join(h.targets[target].replace(/^builds\//, ''), 'index.html')
  );
  stream = stream.pipe(filt);
  switch (target) {
    case 'build':
      /**************
      embed livereload script in build/index.html
      **************/
      stream = stream.pipe($.embedlr());
      break;
    case 'unit':
      break;
  }
  return stream.pipe(filt.restore());
};

function organizeBuildStream (stream) {
  stream = stream.pipe($.if(
    ['**/src/**'],
    $.rebase('src')
  ));
  stream = stream.pipe($.if(
    ['**/test/unit-tests/**'],
    $.rebase('unit')
  ));

  return stream;
}


/*************************
this is the main building
function for builds and
incremental watch buils

stream should be the combination of sources from which we are based (from
a path perspective) on their original location.
**************************/
var buildStream = function (stream) {
  var filt;
  var targets;
  var buildStream;
  var unitStream;

  hadErrors = false;

  stream = stream.pipe($.plumber(plumberErrorHandler));

  /***************
  JSHINT/JSCS -- different rules for different sources
  Avoid browserify files.
  ****************/
  filt = $.filter(['src/**/*.js', '!**/*.browserify.*']);
  stream = stream.pipe(filt)
    .pipe($.jshint(path.join(srcDir, '.jshintrc')))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'))
    .pipe($.jscs(path.join(h.rootDir, '.jscsrc')));
  stream = stream.pipe(filt.restore());

  filt = $.filter('unit/**/*.js');
  stream = stream.pipe(filt)
    .pipe($.jshint(path.join(unitSrcDir, '.jshintrc')))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'))
    .pipe($.jscs(path.join(h.rootDir, '.jscsrc')));

  stream = stream.pipe(filt.restore());

  /***************
  BROWSERIFY -- use node modules in the browser.
  ****************/
  var browserify = require('browserify');
  var doBrowserify = function (file) {
    file.contents = browserify({ entries: [ file.path ] }).bundle();
  };
  filt = $.filter('**/*.browserify.*');
  stream = stream.pipe(filt)
    .pipe($.tap(function (file) { doBrowserify(file); }))
    .pipe($.buffer())
    .pipe(filt.restore());

  filt = $.filter('src/**/*');
  var srcFiles = stream.pipe($.filter('src/**/*'));
  // when we restore from filt it will bring back the non-src file.
  // but now we're going to branch clone the src files

  targets = $.branchClones({
    src: srcFiles,
    targets: ['build', 'unit']
  });


  buildStream = targets['build'];

  /***************
  SASS
  ****************/

  var otherDirs = [
    'bower_components/bourbon/dist',
    'bower_components/bitters/app/assets/stylesheets',
    'bower_components/neat/app/assets/stylesheets'
  ];

  var sassPipe;
  var sassParams;
  if (buildParams.sassCompiler === 'ruby-sass') {
    sassParams = {
      sourcemap: true,
      sourcemapPath: '.',
      loadPath: bootstrapDir//otherDirs //.concat(bootstrapDir)
    };

    sassPipe = lazypipe()
      .pipe(
        h.fs.src, [
          path.join(srcDir, '**/*.scss'),
          path.join(bootstrapDir, '**/*.scss')
        ],
        { base: h.rootDir }
      )
      // .pipe($.plumber, plumberErrorHandler)
      .pipe($.rubySass, sassParams);
      // .pipe($.plumber.stop);

    buildStream = buildStream
      .pipe(
        $.if(
          '**/*.scss',
          sassPipe()
            .on('error', function () {})
        )
      );
  }
  else {
    sassParams = {
      onError: plumberErrorHandler,
      includePaths: [bootstrapDir] //otherDirs // .concat(bootstrapDir)
    };

    if (buildParams.sassCompiler !== 'node-sass-safe' &&
        process.platform !== 'win32'
    ) {
      sassParams.sourceComments = 'map';
      sassParams.sourceMap = 'sass';
    }

    sassPipe = lazypipe()
      .pipe(h.fs.src, path.join(srcDir, '**/*.scss'))
      .pipe($.sass, sassParams);

    buildStream = buildStream
      .pipe($.if('**/*.scss', sassPipe()));

  }

  // ?ruby sass apparently can't do inline source maps?
  //
  // so we won't remove the scss files even though node-sass puts the sourcemap
  // info inline... or something like that
  // buildStream = buildStream
  //   .pipe(
  //     $.ignore.exclude(['styles/**/*', '!styles/**/*.css'])
  //   );

  // build stream is the easy part
  buildStream = buildStream.pipe($.rename(
    function (filepath) {
      filepath.dirname = filepath.dirname.replace(/^src[\/]?/, '');
    }
  ));

  buildStream = buildStream
    .pipe($.rebase(h.targets.build));

  /***********************
  UNIT STREAM break out.  TODO: factor this out
  ************************/
  unitStream = targets['unit'];

  //might as well drop things that we won't be using
  unitStream = unitStream.pipe($.rename(
    function (filepath) {
      filepath.dirname = filepath.dirname.replace(/^src[\/]?/, '');
    }
  ));
  // unit stream needs to be reassembled
  var unitFiles = stream.pipe($.filter('unit/**/*'));
  unitFiles = unitFiles.pipe($.rename(
    function (filepath) {
      filepath.dirname = filepath.dirname.replace(/^unit[\/]?/, '');
    }
  ));

  // for the unit stream, first get everyone in the same place (move the
  // filesFromUnit = filesFromUnit.pipe($.rebase(h.src));
  unitStream = merge(
    unitStream,
    unitFiles
  );
  unitStream = unitStream.pipe($.filter(['!index.html', '!run.js']));
  unitStream = unitStream.pipe($.rebase(h.targets.unit));

  /****************
  TEMPLATE
  *****************/
  filt = $.filter(['**/*.html', '**/*.js']);
  buildStream = buildStream.pipe(filt)
    .pipe($.template(buildParams.build))
    .pipe(filt.restore());
  filt = $.filter(['**/*.html', '**/*.js']);
  unitStream = unitStream.pipe(filt)
    .pipe($.template(buildParams.unit))
    .pipe(filt.restore());

  buildStream = indexHtmlStream(buildStream, 'build');
  unitStream = indexHtmlStream(unitStream, 'unit');

  var out = merge(buildStream, unitStream);

  out
    .on('error', $.util.log)
    .on('error', $.util.beep);

  // deadweight directories will not be written
  out = out.pipe(
    $.ignore.exclude({ isDirectory: true })
  );

  out = out.pipe(h.fs.dest('builds'));

  return out;

};

function rubySassCheck () {
  if (buildParams.sassCompiler === 'ruby-sass') {
    var which = require('shelljs').which;

    if (!which('sass') || !which('ruby')) {
      $.util.log('[' + chalk.cyan('build') + '] ' +
        chalk.yellow('ruby-sass') +
        ' configured but ' + chalk.red('ruby and/or ruby-sass not found'));
      $.util.log('[' + chalk.cyan('build') + '] ' +
        chalk.yellow('falling back to ') + chalk.green('node-sass-safe') +
        ' (which does not require sass)');

      buildParams.sassCompiler = 'node-sass-safe';
    }
  }
}

tasks.build = {
  deps: ['clean', 'bower-files'],
  func: function (cb) {

    rubySassCheck();

    var srcs = h.fs.src([
      path.join(h.src, '**/*'),
      path.join(h.unitSrc, '**/*'),
    ]);

    srcs = organizeBuildStream(srcs);
    return buildStream(srcs);

  }
};

process.on('SIGINT', function () {
  closeActiveServers();
  process.exit();
});

function startServer (path, port) {
  if (!getActiveServer(port)) {
    var connect = require('connect');
    var url = require('url');
    var proxy = require('proxy-middleware');
    var serveStatic = require('serve-static');

    var server = connect()
      .use('/v1', proxy(url.parse('http://localhost:8090/v1')))
      .use(
        require('connect-modrewrite')(
        // if lacking a dot, redirect to index.html
          ['!\\. /index.html [L]']
        )
      )
      .use(serveStatic(path, {redirect: false}))
      .listen(port, '0.0.0.0');

    server.on('error', function (err) {
      console.log(err);
    });
    setActiveServer(port, server);

    return server;
  }
}

function startIstanbulServer (testerPath, port) {
  if (!getActiveServer(port)) {
    var express = require('express');
    var im = require('istanbul-middleware');
    var bodyParser = require('body-parser');
    var app = express();
    var url = require('url');

    im.hookLoader(testerPath);
    app.use('/coverage', require('connect-livereload')({
      port: 35730
    }));
    app.use('/coverage', im.createHandler());
    app.use(im.createClientHandler(
      path.resolve(testerPath),
      {
        matcher: function (req) {
          // cover js files that aren't .unit.js and are not ext dependencies
          var parsed = url.parse(req.url).pathname;
          if (!/\.js$/.test(parsed)) {
            return false;
          }
          if (parsed.match(/index\.js/)) {
            // its a modules index file
            return false;
          }
          if (!(parsed.match(/^\/.+\/.+\//))) {
            // it's not deep enough to be the code we really want to test
            return false;
          }
          if (parsed.match(/^\/mocks\//)) {
            // it's part of the mocks modules
            return false;
          }
          var isBrowserify = /\.browserify\.js$/.test(parsed);
          var isTestCode = /\.unit\.js$/.test(parsed);
          // console.log(parsed + ' is test code: ' + isTestCode);
          var isDependency = /^\/deps\//.test(parsed);
          // console.log(parsed + ' is dep. code: ' + isDependency);
          return !(isTestCode || isBrowserify || isDependency);
        }
        // pathTransformer: function (req) {
        // }
      }
    ));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.use(express['static'](path.resolve(testerPath)));
    var httpServer = require('http').createServer(app);
    httpServer.listen(port,'0.0.0.0');

    setActiveServer(port, httpServer);
  }
}

function runTests (opts, cb) {
  startIstanbulServer(h.targets.unit, 3004);
  var myOpts = opts || {};
  myOpts.silent = true;
  var stream = $.mochaPhantomjs(myOpts);
  // clear screen
  process.stdout.write('\u001b[2J');
  // set cursor position
  process.stdout.write('\u001b[1;3H' + chalk.blue('\nUnit Tests:'));
  stream.on('error', cb);
  stream.on('after_flush', cb);
  stream.write({path: 'http://localhost:3004/unit-runner.html'});
  stream.end();
}

tasks['unit'] = {
  deps: ['build'],
  // deps: [],
  func: function (cb) {
    if (hadErrors || rebuildOnNext) {
      $.util.log('skipping unit tests due to build errors');
      cb();
    }
    else {
      runTests({ reporter: mochaReporter }, function () {
        if (!watchTaskCalled) {
          closeActiveServers();
        }
        cb();
      });
    }
  }
};

function writeRunMenu () {
  var ten = '          ';
  var message;

  message = '\n\n' + ten +
      '--> ' + chalk.magenta('BUILD server') + ' : ' +
      chalk.bold.blue('http://localhost:3000') +
      '\n' + ten +
      '--> ' + chalk.magenta('UNIT TESTS') + '   : ' +
      chalk.bold.blue('http://localhost:3001/unit-runner.html') +
      '\n' + ten +
      '--> ' + chalk.magenta('COVERAGE') + '   : ' +
      chalk.bold.blue('http://localhost:3004/coverage') +
      '\n';
  process.stdout.write(message);
}

function writeWatchMenu () {
  var ten = '          ';
  var message;

  message = '\n' + ten +
      '--> ' + chalk.magenta('BUILD') + '        : ' +
      chalk.bold.blue('http://localhost:3000') +
      '\n' + ten +
      '--> ' + chalk.magenta('UNIT TESTS') + '   : ' +
      chalk.bold.blue('http://localhost:3001/unit-runner.html') +
      '\n' + ten +
      '--> ' + chalk.magenta('COVERAGE') + '     : ' +
      chalk.bold.blue('http://localhost:3004/coverage') +
      '\n' + ten +
      'watching for ' + chalk.green('changes') + ' to the ' +
      chalk.red.italic.dim('src') + ' and ' +
      chalk.red.italic.dim('test') + ' directories\n';

  process.stdout.write(message);
}

tasks['run'] = {
  deps: ['build', 'unit'],
  func: function (cb) {
    startServer(h.targets.build, 3000);
    startServer(h.targets.unit, 3001);
    startIstanbulServer(h.targets.unit, 3004);
    cb();
    writeRunMenu();
  }
};

watchTaskCalled = false;
tasks['watchCalled'] = {
  deps: [],
  func: function (cb) {
    watchTaskCalled = true;
    cb();
  }
};

function lrSetup (port, glob, name, fileRelativizer, cb) {
  var tinylr = require('tiny-lr-fork');
  var lrServer = new tinylr.Server();
  lrServer.listen(port, function () {
    var watcher = $.watch({
      glob: glob, // path.join(h.targets.build, '**/*'),
      name: name, // 'reload-watch',
      emitOnGlob: false,
      emit: 'one',
      silent: true
    })
    .on('data', function (file) {
      file.base = path.resolve('./build');
      lrServer.changed({
        body: {
          files: [
            fileRelativizer(file)
          ]
        }
      });
      return file;
    });
    watcher.on('error', function (e) {
      console.log('caught gaze error: ' + e.toString());
    });
    setActiveServer(name, watcher);
    setActiveServer(port, lrServer);
    if (cb) {
      cb();
    }
  });
}

function lrManualSetup (port, cb) {
  var tinylr = require('tiny-lr-fork');
  var lrServer = new tinylr.Server();

  lrServer.listen(port, function () {
    var changer = function (files) {
      lrServer.changed({ body: { files: files } });
    };
    setActiveServer(port, lrServer);
    cb(changer);
  });
}

tasks['watch'] = {
  deps: ['watchCalled', 'build', 'unit'],
  func: function (cb) {
    startServer(h.targets.build, 3000);
    startServer(h.targets.unit, 3001);
    startIstanbulServer(h.targets.unit, 3004);
    amWatching = true;

    var lrChanger;
    lrManualSetup(
      35730,
      function (changer) {
        lrChanger = changer;
      }
    );


    var watcher = $.watch({
      glob: [path.join(h.src, '**/*'), path.join(h.unitSrc, '**/*')],
      name: 'watch',
      emitOnGlob: false,
      emit: 'one',
      silent: true
    }, function (file, gulpWatchCb) {
      file.pipe($.util.buffer(function (err, files) {
        var relpath = path.relative(
          path.join(__dirname, '../src'), files[0].path
        );
        $.util.log('[' + chalk.cyan('watch') + '] ' +
            chalk.bold.blue(relpath) + ' was ' + chalk.magenta(files[0].event));

        if (!(files[0].event === 'changed' || files[0].event === 'added')) {
          refireWatchTask();
        }
        else if (rebuildOnNext) {
          $.util.log('[' + chalk.cyan('watch') + '] ' +
              chalk.yellow(
                'some changes not written on previous change -- rebuilding'
              ));
          refireWatchTask();
        }
        else {
          files = readArray(files);

          files = organizeBuildStream(files);

          var out = buildStream(files).pipe(
            $.util.buffer(function (err, files) {
              if(!rebuildOnNext && !hadErrors) {
                runTests({ reporter: mochaReporter }, function () {
                  lrChanger(['/coverage', '/coverage/show']);
                  gulpWatchCb();
                  writeWatchMenu();
                });
              }
              else {
                gulpWatchCb();
                writeWatchMenu();
              }
            })
          );
        }
      }));
    });
    watcher.on('error', function (e) {
      console.log('caught gaze error: ' + e.toString());
    });

    setActiveServer('watcher', watcher);

    lrSetup(
      35729,
      path.join(h.targets.build, '**/*'),
      'reload-build-watch',
      function (file) {
        file.base = path.resolve('./build');
        return file.relative;
      },
      function () {
        writeWatchMenu();
        if (cb) {
          // if we restarted this function then no cb is available or
          // necessary
          cb();
        }
      }
    );

  }
};

var seleniumParts = buildParams['e2e'].seleniumAddress.match(
  /([^:]*):\/\/([^:]*):(.*)[\/]?$/
);
var seleniumProtocol = seleniumParts[1];
var seleniumHost = seleniumParts[2];
var seleniumPort = seleniumParts[3];

var seleniumVersion;
var seleniumJar;
var seleniumServer;
var seleniumUrl;
var wd;

tasks['selenium-present'] = {
  deps: [],
  func: function (cb) {

    var onPresent = function () {
      var ptorDir = path.join(__dirname, '../node_modules/protractor');
      var protractorPkg = require(path.join(ptorDir, 'package.json'));
      seleniumVersion = protractorPkg.webdriverVersions.selenium;
      var jarFile = 'selenium-server-standalone-' + seleniumVersion + '.jar';
      seleniumJar = path.join(ptorDir, 'selenium', jarFile);
      var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

      var args = [];
      var chromeArg = '-Dwebdriver.chrome.driver=' +
        path.join(
          __dirname,
          '../node_modules/protractor/selenium/chromedriver'
        );
      var phantomArg = '-Dphantomjs.binary.path=' +
        path.join(
          __dirname,
          '../node_modules/phantomjs/bin/phantomjs'
        );

      args.push(chromeArg);
      args.push(phantomArg);

      seleniumServer = new SeleniumServer(seleniumJar, {
        // args: 'D'-Dwebdriver.chrome.driver="D:\dev\chromedriver.exe"
        port: seleniumPort,
        args: args
      });
      cb();
    };

    childProcess.spawn(
      path.join(
        __dirname,
        '../node_modules/protractor/bin/webdriver-manager' + winExt
      ),
      ['update'],
      {
        stdio: 'inherit'
      }
    )
        .once('close', onPresent);
  }
};

tasks['selenium-start'] = {
  deps: ['selenium-present'],
  func: function (cb) {


    seleniumServer.start({
      stdio: 'inherit'
    }).then(
      function started (url) {
        seleniumUrl = url;
        // console.log('selenium server listening at ' + url);
        cb();
      },
      function failed (reason) {
        throw new Error(reason);
      }
    );
  }
};

tasks['selenium-stop'] = {
  deps: ['selenium-present'],
  func: function (cb) {
    seleniumServer.stop().then(
      function stopped () {
        console.log('stopped selenium');
        seleniumServer = null;
        cb();
      },
      function cantStop (reason) {
        throw new Error(reason);
      }
    );

  }
};

var ptorConfig = {
  stackTrace: false,
  allScriptsTimeout: 5000,
  baseUrl: 'http://localhost:3002',
  rootElement: 'html',
  chromeOnly: false,
  framework: 'cucumber',
  specs: [
    path.join(__dirname, '../../specs/features')
  ],
  params: {
    login: {
      user: 'Jane',
      password: '1234'
    }
  },
  cucumberOpts: {
    require: path.join(__dirname, '../test/cucumber-support/**/*.js'),
    // tags: '@dev', use to subset the tests -- tbd how to incporporate into
    // the process https://github.com/angular/protractor/pull/546
    format: 'pretty'
  },

  capabilities: {

    browserName: 'chrome',
    // 'phantomjs.binary.path': path.join(
    //   __dirname, '../node_modules/phantomjs/bin/phantomjs'
    // ),
    // 'phantomjs.cli.args': ['--logfile=PATH', '--loglevel=DEBUG'],

    // 'browserName': 'chrome'
    // 'browserName': 'firefox'
  }
};

tasks['e2e'] = {
  deps: ['build', 'selenium-start'],
  func: function (cb) {
    startServer(h.targets.build, 3002);

    ptorConfig.seleniumAddress = seleniumUrl;
    var Runner = require('protractor/lib/runner');
    var runner = new Runner(ptorConfig);
    runner.run().then(
      function complete (exitCode) {
        closeActiveServers();
        cb();
      },
      function failed (exitCode) {
        console.log('protractor runner failed with exit code ' + exitCode);
        closeActiveServers();
        cb();
      }
    );

  }
};

/*
 * temporary patcher of seed data
 */
tasks['dbpatch'] = {
  deps: [],
  func:function () {
    var moment = require('moment');
    var hasAnswers = 0;
    var s = gulp.src(
      'questions/**.json',
      { cwd: path.resolve(__dirname, '../../database/seed-data')}
    );
    s = s.pipe($.tap(function (file) {
      var j = JSON.parse(file.contents.toString());
      j.id = j.id.replace(/\/\//g, '/');
      j.id = j.id.replace(/\.json\.json$/g, '.json');
      var newTags = [];
      for (var i = 0; i < j.tags.length; i++) {
        if (j.tags[i] instanceof Array) {
          newTags.push(j.tags[i][0]);
        }
        else {
          newTags.push(j.tags[i]);
        }
      }
      j.tags = newTags;
      j.id = j.id.replace(/\/questions/g, '');
      j.id = j.id.replace(/\.json$/, '');
      j.id = j.id.replace(/\//g, '');
      j.id = '/questions/' + j.id;
      if (j.acceptedAnswerId) {
        j.acceptedAnswerId = j.acceptedAnswerId.replace(/answers/, '');
        j.acceptedAnswerId = j.acceptedAnswerId.replace(/\//g, '');
        j.acceptedAnswerId = j.acceptedAnswerId.replace(/\.json$/g, '');
        j.acceptedAnswerId = '/answers/' + j.acceptedAnswerId;
      }
      _.forEach(j.answers, function (answer) {
        answer.id = answer.id.replace(/answers/, '');
        answer.id = answer.id.replace(/\//g, '');
        answer.id = answer.id.replace(/\.json$/g, '');
        answer.id = '/answers/' + answer.id;
        delete answer.creationYearMonth;
      });
      if (j.answers && j.answers.length) {
        console.log(++hasAnswers);
      }
      if (j.lastActivityDate) {
        j.lastActivityDate = moment(j.lastActivityDate).year(2014)
            .toISOString().replace(/Z.*$/, '');
      }
      if (j.creationDate) {
        j.creationDate = moment(j.creationDate).year(2014)
            .toISOString().replace(/Z.*$/, '');
      }
      if (j.owner && !j.lastActivityDate) {
        j.lastActivityDate = new Date().toISOString().replace(/Z.*$/, '');
      }
      if (j.lastActivityDate) {
        j.creationYearMonth = moment(j.lastActivityDate).format('YYYYMM');
      }
      else {
        delete j.creationYearMonth;
      }
      file.contents = new Buffer(JSON.stringify(j, null, '  '));
    }));

    return s.pipe(
      gulp.dest(
        'questions',
        { cwd: path.resolve(__dirname, '../../database/seed-data')}
      )
    );
  }
};
