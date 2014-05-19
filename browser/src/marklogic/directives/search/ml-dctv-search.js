(function (undefined) {

  var module = this.angular.module('marklogic.dctv.search', [
  ]);

  module.directive('mlSearch', global.mlSearchDctv);
  module.directive('mlSearchBuilder', global.mlSearchBuilderDctv);


}).call(global);
