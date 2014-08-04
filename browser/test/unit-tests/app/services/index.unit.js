define([
  './appRouting.unit'
], function (
  appRouting
) {

  return function () {

    describe('services', function () {
      appRouting();
    });

  };
});
