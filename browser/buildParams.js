var defaultParams = {
  min: '',
  appName: 'app',
  unit: false,
  e2eMock: true,
  noscriptHtml: '<p>You need a script-enabled browser.</p>',
  pkg: require('./package.json'),
  restUrl: 'http://localhost:8090',
  ngModuleDepencencies: [
    'ui.router',
    'ui.router.stateHelper',
    'ui.bootstrap',
    'angularSpinner',
    'dialogs.main',
    'ngSanitize',
    'hc.marked'
  ],
  html5Mode: true,
  seleniumAddress: 'http://localhost:4445',
  // if true, disable sourcemaps b/c node-sass segfaults on syntax err
  sassCompiler: 'node-sass-safe'
  // ***********************************************************************
  // WARNING: 'roby-sass' options is experimental and is not likely to work,
  // yet.
  // ***********************************************************************
  
  // node-sass is *much* faster than ruby-sass. In a watch environment while
  // editing scss file and relying on live-reload to see changes, the difference
  // in speed is palpable.
  //
  // However, node-sass uses libsass, and between the two of them there is
  // currently a bug which causes segfaults if libsass encounters a syntax
  // error. As such, this setting is provided to allow for workarounds.
  //
  // The segfaults seem only to ocurr when sourceMaps are enabled, so one option
  // is to disable them. However, sourceMaps with sass are very useful in
  // developing styles.
  //
  // As such, another option is to use the slower ruby compiler.
  //
  // The recommended configuration is to use node-sass and to use a syntax
  // checker in your development environment, (e.g. a linter in the Atom
  // editor) so that you are less likely to save a syntax error.
  //
  // However, if you want to reduce the likelihood of having to restart your
  // `gulp watch`, then you can either use node-sass and disable sourceMaps or
  // you can use ruby-sass (if you have Ruby installed!).
  //
  // alternative settings here are:
  //
  //   `'node-sass'` (default): If not specifieduse node-sass and have it
  //   generate source maps.
  //
  //   `'node-sass-safe'``: use node-sass but do not generate source maps.
  //
  //   `'ruby-sass'`: use ruby-sass. If you do not have ruby-sass installed,
  //   a warning will be reported and the build will fall back to
  //   node-sass-safe mode.
};

defaultParams.appSettings = {
  version: defaultParams.pkg.version,
  appName: defaultParams.appName,
  html5Mode: true
};

var targetParams = {
  // build target specifics
  build: {
  },
  // unit target specifics
  unit: {
    unit: true,
    e2eMock: false,
  },
  // e2e target specifics
  e2e: {

  },
  // dist target specifics
  dist: {

  }
};

var _ = require('lodash');

// overlay target specific
var params = {};
_.merge(params, defaultParams);
_.forEach(targetParams, function(targetParams, targetName) {
  params[targetName] = _.merge(
    _.clone(defaultParams),
    targetParams
  );
});


/**
 * Parameters for builds
 * @type {Object}
 */
module.exports = params;
