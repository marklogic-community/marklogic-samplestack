define([
  './_layout.unit',
  './_root.unit',
  './explore.unit',
  './fourOhFour.unit',
  './qnaDoc.unit'
], function (
  _layout,
  _root,
  explore,
  fourOhFour,
  qnaDoc
) {

  return function () {

    describe('states', function () {
      _layout();
      _root();
      explore();
      fourOhFour();
      qnaDoc();
    });

  };
});
