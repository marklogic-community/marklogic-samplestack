define([
  'app/module'
], function (module) {
  var generateWizToolbarBtnHTML = function (command) {
    var html =
      '<wiz-toolbar-button command="' + command + '">' +
        '<img src="/app/images/ss-markdown-editor/md-' + command + '.png" />' +
        '</wiz-toolbar-button>';
    return html;
  };

  /**
   * @ngdoc directive
   * @name ssMarkdownEditor
   * @restrict A
   * @param {expression} ssMarkdownEditor the content to which to bind
   *
   * @description
   * Enables editing of Markdown content with preview tab and editing controls
   * in a button-bar.  Uses {@link ssMarkdown} for preview and and
   * <a href="https://github.com/GrumpyWizards/ngMarkdown"
   * target="_blank">ngMarkdown</a> for button bar functionality.
   */

  module.directive('ssMarkdownEditor', [function () {
    return {
      restrict: 'A',
      template: '<div class="ss-markdown-editor">' +
            '<tabset>' +
              '<tab>' +
                '<tab-heading>' +
                  'edit' +
                '</tab-heading>' +
                '<wiz-markdown-editor content="content">' +
                    generateWizToolbarBtnHTML('bold') +
                    generateWizToolbarBtnHTML('italic') +
                    generateWizToolbarBtnHTML('heading') +
                    '<span class="divider">|</span>' +
                    generateWizToolbarBtnHTML('code') +
                    generateWizToolbarBtnHTML('ollist') +
                    generateWizToolbarBtnHTML('ullist') +
                    generateWizToolbarBtnHTML('link') +
                    generateWizToolbarBtnHTML('img') +
                    generateWizToolbarBtnHTML('hr') +
                    '<span class="divider">|</span>' +
                    generateWizToolbarBtnHTML('undo') +
                    generateWizToolbarBtnHTML('redo') +
                '</wiz-markdown-editor>' +
              '</tab>' +
              '<tab>' +
                '<tab-heading>' +
                  'preview' +
                '</tab-heading>' +
                '<div class="ss-markdown-editor-preview" ' +
                    'ss-markdown="content"></div>' +
              '</tab>' +
            '</tabset>' +
          '</div>',
      scope: {
        content: '=content'
      }
    };
  }]);
});
