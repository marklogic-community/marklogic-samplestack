var defaultParams = {
  appName: 'soDemo',
  noscriptHtml: '<p>You need a script-enabled browser.</p>'
};

var targetParams = {
  // build target specifics
  build: {
  },
  // unit target specifics
  unit: {
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
