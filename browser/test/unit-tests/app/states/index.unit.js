define([
  './_layout.unit',
  './_root.unit',
  './fourOhFour.unit'
], function (
  _layout,
  _root,
  fourOhFour
) {

  return function () {

    describe('states', function () {
      _layout();
      _root();
      fourOhFour();
    });

  };
});
