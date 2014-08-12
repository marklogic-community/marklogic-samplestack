define([
  './ssSearch.unit',
  './ssSession.unit'
], function (
  ssSearch,
  ssSession
) {

  return function () {

    describe('domain', function () {
      ssSearch();
      ssSession();
    });

  };
});
