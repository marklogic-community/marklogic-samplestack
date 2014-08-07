define([
  './ssAccountDropdown.unit',
  './ssFacetDateRange.unit',
  './ssMarkdown.unit',
  './ssMarkdownEditor.unit'
], function (
  ssAccountDropdown,
  ssFacetDateRange,
  ssMarkdown,
  ssMarkdownEditor
) {

  return function () {

    describe('directives', function () {
      ssAccountDropdown();
      ssFacetDateRange();
      ssMarkdown();
      ssMarkdownEditor();
    });

  };
});
