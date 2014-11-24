define([
  'app/module'
], function (module) {

  /**
   * @ngdoc directive
   * @name ssMarkdown
   * @restrict A
   * @param {string} ssMarkdown Name of the scope property to which
   * to
   * bind.
   *
   * @description
   * Wraps an instance of
   * [angular-marked](https://://github.com/Hypercubed/angular-marked).
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
