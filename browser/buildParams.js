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
