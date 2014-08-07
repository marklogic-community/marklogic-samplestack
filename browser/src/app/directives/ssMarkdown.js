define([
  'app/module'
], function (module) {

  /**
   * @ngdoc directive
   * @name ssMarkdown
   * @restrict A
   * @element ANY
   *
   * @description
   * TBD
   */
  module.directive('ssMarkdown', [function () {
    return {
      restrict: 'A',
      compile: function (tElement, tAttrs) {
        tElement.append('<div marked="' + tAttrs.ssMarkdown + '"></div>');
      }
    };
  }]);
});
