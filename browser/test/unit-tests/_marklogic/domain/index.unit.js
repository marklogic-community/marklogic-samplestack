define([
  './mlSearch.unit',
  './mlSession.unit'
], function (
  mlSearch,
  mlSession
) {

  return function () {

    describe('domain', function () {
      mlSearch();
      mlSession();
    });

  };
});
