define([
  './mlAuth.unit',
  './data/index.unit',
  './util/index.unit'
], function (
  mlAuth,
  data,
  util
) {

  return function () {

    describe('services', function () {
      mlAuth();
      data();
      util();
    });

  };
});
