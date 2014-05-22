/**
 * Proto-tasks -- the objects exported are to be converted to tasks by a
 * gulpfile.  This module exists to allow for its tasks to be driven
 * from outside of this project (.e.g from a larger app that combines
 * a Node.js server with this browser app).
 * @type {Object}
 */
var tasks = module.exports = {};

var path = require('path');
var _ = require('lodash');
var fs = require('fs');
var chalk = require('chalk');
var gulp = require('gulp');
var merge = require('event-stream').merge;
var readArray = require('event-stream').readArray;
var globule = require('globule');
var lazypipe =require('lazypipe');

var childProcess = require('child_process');
var winExt = /^win/.test(process.platform) ? '.cmd' : '';

// var fs = require('fs');
// var download = require('download');

var h = require('./helper');
var buildParams = require('../buildParams');

// make it easier to get to plugins
var $ = h.$;

var buildDir = path.join(h.rootDir, h.targets.build);
var unitDir = path.join(h.rootDir, h.targets.unit);
var distDir = path.join(h.rootDir, h.targets.dist);
var srcDir = path.join(h.rootDir, h.src);
var unitSrcDir = path.join(h.rootDir, h.unitSrc);

var bootstrapDir =
    'bower_components/bootstrap-sass-official/vendor/assets/stylesheets';


/**************************
stuff about dealing with
watch having to be restarted
**************************/
var amWatching = false;
var activeServers;
var rebuildOnNext = false;

function closeActiveServers() {
  activeServers.forEach(function (server) {
    try {
      server.close();
    } catch (err) {}
  });

}
function refireWatchTask (servers) {
  // $.util.log('[' + chalk.cyan('watch') + '] ' +
  //     chalk.yellow('initiating rebuild'));
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
    activeServers.forEach(function (server) {
      try {
        server.close();
      } catch (err) {}
    });
    rebuildOnNext = true;
    tasks['watch'].func();
  }
}

function trim (str) { return str.replace(/^\s+|\s+$/g, ''); }
var plumberErrorHandler = function (err) {
  $.util.log(
    $.util.colors.cyan('Plumber') +
    chalk.red(' found unhandled error:\n\n') +
    trim(err.toString()) + '\n'
  );
  if (!rebuildOnNext) {
    rebuildOnNext = true; // rebuild after the next save
    $.util.log('[' + chalk.cyan('watch') + '] ' +
        chalk.yellow(
          'some changes not written -- will rebuild on next change'
        ));
    if (amWatching) {
      refireWatchFunc();
    }
  }
};

/********************
tasks
********************/

// rimraf all of the target directories
tasks.clean = {
  deps: [],
  func: function () {
    return h.fs.src([
      path.join(buildDir, '**/*'),
      path.join(unitDir, '**/*'),
      path.join(distDir, '**/*'),
      '!**/*.md' // leave any markdown docs, they're there for a reason
    ], {read: false})
      .pipe($.rimraf());
  }
};

var bowerBuildStream = function (read) {
  return $.bowerFiles({
    includeDev: false,
    // debugging: true,
    dependencies: false,
    read: read
  });
};

var bowerUnitStream = function (read) {
  return $.bowerFiles({
    includeDev: true,
    // debugging: true,
    dependencies: false,
    read: read
  });
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
  var filt = $.filter(path.join(h.targets[target], 'index.html'));
  stream = stream.pipe(filt);

  switch (target) {
    case 'build':
      // stream = stream
        // .pipe($.inject((h.fs.src('/bower_components/'))))
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

  // protection from unhandled errors in plugins (ahem -- SASS!)
  stream = stream.pipe($.plumber(plumberErrorHandler));

  // there are some things we can do before we diverge
  /***************
  JSHINT -- different rules for different sources
  Avoid browserify files.
  ****************/
  filt = $.filter(['src/**/*.js', '!**/*.browserify.*']);
  stream = stream.pipe(filt)
    .pipe($.jshint(path.join(srcDir, '.jshintrc')))
    .pipe($.jshint.reporter('jshint-stylish'));
  stream = stream.pipe(filt.restore());

  filt = $.filter('unit/**/*.js');
  stream = stream.pipe(filt)
    .pipe($.jshint(path.join(unitSrcDir, '.jshintrc')))
    .pipe($.jshint.reporter('jshint-stylish'));
  stream = stream.pipe(filt.restore());

  // now we need to diverge our handling
  //
  // the src dir is applicable to build and unit, so we need to get it cloned
  // the first step is to isolate these files

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

  var sassPipe = lazypipe()
    .pipe(h.fs.src, path.join(srcDir, '**/*.scss'))
    .pipe($.sass, {
      sourceComments: 'map',
      includePaths: [bootstrapDir]
    });

  buildStream = buildStream.pipe($.if('**/*.scss', sassPipe()));
  buildStream = buildStream
    .pipe(
      $.ignore.exclude(['styles/**/*', '!styles/**/*.css'])
    );

  // build stream is the easy part
  buildStream = buildStream.pipe($.rename(
    function (filepath) {
      filepath.dirname = filepath.dirname.replace(/^src[\/]?/, '');
    }
  ));
  buildStream = buildStream
    .pipe($.rebase(h.targets.build))
    .pipe($.plumber(plumberErrorHandler));


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
  unitStream = unitStream.pipe($.rebase(h.targets.unit))
    .pipe($.plumber(plumberErrorHandler));

  // buildStream = buildStream.pipe($.filter(['!styles/']));
  unitStream = unitStream
    .pipe(
      $.ignore.exclude(['**/*.scss', '**/*.png'])
    );

  // for later -- a dist-style SASS
  // filt = $.filter(['**/*.scss', '!**/_*.scss']);
  // src = src.pipe(filt);
  // src = src.pipe($.sass({
  //   sourceComments: 'map',
  //   includePaths: [bootstrapDir]
  // })).pipe(filt.restore().pipe($.filter('!**/*.scss')));
  //

  /***************
  BROWSERIFY -- use node modules in the browser.
  running this on each branch because it otherwise behaves flakily
  ****************/
  filt = $.filter('**/*.browserify.*');
  buildStream = buildStream.pipe(filt)
    .pipe($.browserify({}));
  buildStream = buildStream.pipe(filt.restore());
  filt = $.filter('**/*.browserify.*');
  unitStream = unitStream.pipe(filt)
    .pipe($.browserify({}));
  unitStream = unitStream.pipe(filt.restore());

  /****************
  TEMPLATE
  *****************/

  buildParams.build.mlComponents =
      globule.find(
        ['marklogic/**/*.js'],
        { cwd: path.join(__dirname, '..', h.src, '/')}
      );
  buildParams.unit.mlComponents = buildParams.build.mlComponents;
  buildParams.build.appComponents =
      globule.find(
        ['app/**/*.js'],
        { cwd: path.join(__dirname, '..', h.src, '/')}
      );
  buildParams.unit.appComponents = buildParams.build.appComponents;
  buildParams.unit.unitComponents =
      globule.find(
        ['**/*.unit.js'],
        { cwd: path.join(__dirname, '..', h.unitSrc, '/')}
      );
  buildParams.unit.unitComponents.unshift('testHelper.js');

  filt = $.filter(['**/*.html', '**/*.js']);
  buildStream = buildStream.pipe(filt)
    .pipe($.template(buildParams.build))
    .pipe(filt.restore());
  filt = $.filter(['**/*.html', '**/*.js']);
  unitStream = unitStream.pipe(filt)
    .pipe($.template(buildParams.unit))
    .pipe(filt.restore());

  /***************
  JSCS
  ****************/
  filt = $.filter(['**/*.js', '!**/*.browserify.*']);
  buildStream = buildStream.pipe(filt)
    .pipe($.jscs(path.join(h.rootDir, '.jscsrc')));
  buildStream = buildStream.pipe(filt.restore());
  filt = $.filter(['**/*.js', '!**/*.browserify.*']);
  unitStream = unitStream.pipe(filt)
    .pipe($.jscs(path.join(h.rootDir, '.jscsrc')));
  unitStream = unitStream.pipe(filt.restore());


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

  // out.on('error', function (err) {
  //   $.util.log('caught error' + err);
  // });

  return out;

};

tasks.build = {
  deps: ['clean', 'bower-files'],
  func: function () {
    var srcs = h.fs.src([
      path.join(h.src, '**/*'),
      path.join(h.unitSrc, '**/*'),
    ]);

    srcs = organizeBuildStream(srcs);

    return buildStream(srcs);
  }
};

function startServer (path, port) {
  var connect = require('connect');
  var server = connect()
    .use(
      require('connect-modrewrite')(
      // if lacking a dot, redirect to index.html
        ['!\\. /index.html [L]']
      )
    )
    .use(connect.static(path, {redirect: false}))
    .listen(port, '0.0.0.0');
  return server;
}

tasks['unit'] = {
  deps: ['build'],
  // deps: [],
  func: function (cb) {
    var tempServer = startServer(h.targets.unit, 3001);
    if (!activeServers) {
      activeServers = [];
    }
    activeServers.push(tempServer);
    h.fs.src(path.join(h.targets.unit, 'unit-runner.html'))
    .pipe($.mochaPhantomjs({reporter: 'dot'}))
    .on('error', function () {})
    .pipe(
      $.util.buffer(
        function (err, files) {
          tempServer.close();
          cb();
        }
      )
    );
  }
};

function writeWatchMenu () {
  $.util.log('[' + chalk.cyan('watch') + '] ' +
      'watching for changes to the ' + chalk.magenta(h.src) + ' directory.');
  $.util.log('[' + chalk.cyan('watch') + '] ' +
      '--> ' + chalk.magenta('build server') + ': ' +
      chalk.bold.blue('http://localhost:3000'));
  $.util.log('[' + chalk.cyan('watch') + '] ' +
      '--> ' + chalk.magenta('unit test runner') + ': ' +
      chalk.bold.blue('http://localhost:3001/unit-runner.html'));
}

tasks['run'] = {
  deps: ['build'],
  func: function (cb) {
    activeServers = [];
    activeServers.push(startServer(h.targets.build, 3000));
    activeServers.push(startServer(h.targets.unit, 3001));
    cb();
    $.util.log('[' + chalk.cyan('run') + '] ' +
        '--> ' + chalk.magenta('build server') + ': ' +
        chalk.bold.blue('http://localhost:3000'));
    $.util.log('[' + chalk.cyan('run') + '] ' +
        '--> ' + chalk.magenta('unit test runner') + ': ' +
        chalk.bold.blue('http://localhost:3001/unit-runner.html'));
  }
};

tasks['watch'] = {
  deps: ['build', 'unit'],
  func: function (cb) {
    activeServers = [];
    activeServers.push(startServer(h.targets.build, 3000));
    activeServers.push(startServer(h.targets.unit, 3001));
    amWatching = true;

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
              if(!rebuildOnNext) {
                h.fs.src(path.join(h.targets.unit, 'unit-runner.html'))
                .pipe($.mochaPhantomjs())
                .on('error', function () {})
                .pipe($.util.buffer(
                    function (err, files) {
                      writeWatchMenu();
                      gulpWatchCb();
                    }
                ));
              }
              else {
                // writeWatchMenu();
                gulpWatchCb();
              }
            })
          );
        }
      }));
    });
    activeServers.push(watcher);

    var port = 35729;
    var tinylr = require('tiny-lr-fork');
    var buildLr = new tinylr.Server();
    buildLr.listen(port, function () {
      watcher = $.watch({
        glob: path.join(h.targets.build, '**/*'),
        name: 'reload-watch',
        emitOnGlob: false,
        emit: 'one',
        silent: true
      })
      .on('data', function (file) {
        file.base = path.resolve('./build');
        buildLr.changed({body: { files: [file.relative]}});
        return file;
      });
      activeServers.push(watcher);
      activeServers.push(buildLr);

      writeWatchMenu();

      if (cb) {
        // if we restarted this function then no cb is available or
        // necessary
        cb();
      }

    });
  }
};

var seleniumParts = buildParams.seleniumAddress.match(
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
    path.join(__dirname, '../features/**/*.feature')
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
    activeServers = [];
    activeServers.push(startServer(h.targets.build, 3002));

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


/********************************

something like this to configure protractor

config = {
  cucumberOpts: {
    format: 'pretty'
  }
  // Spec patterns are relative to the location of the spec file. They may
  // include glob patterns.
  suites: {
    homepage: 'tests/e2e/homepage/** / * Spec.js',
  },
å    // nobody has loaded world, the page objects and steps defs here
    // answer -- world is instantiated by stesps, prvovides access to
    protractor stuff for the steps.  steps reuire-in page objects as they
    need them
    steps are preloaded in cucumberopts (see nexxt example right below)


enhance webdriver to compare screenshots:
https://www.npmjs.org/package/webdrivercss
***************/
