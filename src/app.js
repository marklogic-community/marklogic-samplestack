(function (undefined) {

  var app = this.angular.module('app', [
    'ui.router',
    'ui.router.stateHelper',
    'ui.bootstrap',
    'hc.marked',
    'marklogic.svc.schema'
  ]);

  app.constant('settings', {
    version: '<%= pkg.version %>',
    html5Mode: '<%= html5Mode %>'
  });

  this.app = app;

  this.angular.fromJSON = function (json) {
    if (!_.isString(json)) {
      return json;
    }
    else {
      return JSON.parse(json, function (key, val) {
        var momentized = this.moment(val);
        if (momentized.isValid()) {
          return momentized.toDate();
        }
        else {
          return val;
        }
      });
    }
  };

  app.config([
    'markedProvider',
    function (markedProvider) {
      markedProvider.setOptions({gfm: true});
    }
  ]);

}).call(global);
