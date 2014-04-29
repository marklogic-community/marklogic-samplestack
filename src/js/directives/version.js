define(['app'], function(app) {
  app.directive('appVersion', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  });
});
