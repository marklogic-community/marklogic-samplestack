define([
  './directives/index.unit',
  './domain/index.unit',
  './filters/index.unit',
  './services/index.unit'
], function (
  directives,
  domain,
  filters,
  services
) {
  return function () {

    describe('marklogic', function () {
      directives();
      domain();
      filters();
      services();
    });

  };
});
