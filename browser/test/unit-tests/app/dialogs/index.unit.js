define([
  './allTags.unit',
  './contributor.unit',
  './login.unit'
], function (
  allTags,
  contributor,
  login
) {

  return function () {

    describe('dailogs', function () {
      allTags();
      contributor();
      login();
    });

  };
});
