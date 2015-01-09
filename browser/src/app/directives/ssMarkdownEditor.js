define([
  'app/module'
], function (module) {

  /**
   * @ngdoc directive
   * @name ssMarkdownEditor
   * @restrict A
   * @param {expression} ssMarkdownEditor the content to which to bind.
   *
   * @description
   * Enables editing of Markdown content with preview tab and editing controls
   * in a button-bar.  Uses {@link ssMarkdown} for preview and and
   * <a href="https://github.com/GrumpyWizards/ngMarkdown"
   * target="_blank">ngMarkdown</a> for button bar functionality.
   *
   */

  module.directive('ssMarkdownEditor', [function () {
    return {
      restrict: 'A',
      templateUrl: '/app/directives/ssMarkdownEditor.html',
      scope: {
        content: '=content',
        placeholder: '@placeholder'
      },
      link: function (scope, el, attr) {
        scope.selTab = 'edit';
        // Display prompt by adding placeholder attribute to markdown textarea
        if (scope.placeholder) {
          document.getElementsByClassName('markdown-input')[0]
            .setAttribute('placeholder', scope.placeholder);
        }
      }
    };
  }]);
});
