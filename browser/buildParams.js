var defaultParams = {
  min: '',
  appName: 'app',
  noscriptHtml: '<p>You need a script-enabled browser.</p>',
  unit: false,
  pkg: require('./package.json'),
  restUrl: 'http://localhost:8080',
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
  seleniumAddress: 'http://localhost:4445'
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
    unit: true
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
