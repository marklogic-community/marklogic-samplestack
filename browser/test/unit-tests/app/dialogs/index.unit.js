define([
  './contributor.unit',
  './login.unit'
], function (
  contributor,
  login
) {

  return function () {

    describe('dailogs', function () {
      contributor();
      login();
    });

  };
});
