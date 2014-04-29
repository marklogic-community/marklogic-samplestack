define([
  'angular', 'app', 'lodash', 'moment', 'stateManager'
],  function(ng, app, _, moment) {

  // lodash is used so frequently that it's better to make it global.
  // a rare exception to the intent of not using globals
  window._ = _;

  var newFromJson = function(json) {
    if (!_.isString(json)) {
      return json;
    }
    else {
      return JSON.parse(json, function(key, val) {
        var momentized = moment(val);
        if (momentized.isValid()) {
          return momentized.toDate();
        }
        else {
          return val;
        }
      });
    }
  };
  ng.fromJSON = newFromJson;

  app.config(function(markedProvider) {
    markedProvider.setOptions({gfm: true});
  });
});
