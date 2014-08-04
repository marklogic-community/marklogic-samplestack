define([
  './dialogs/index.unit',
  './directives/index.unit',
  './domain/index.unit',
  './services/index.unit',
  './states/index.unit'
], function (
  dialogs,
  domain,
  directives,
  services,
  states
) {
  return function () {

    describe('app', function () {
      dialogs();
      domain();
      directives();
      services();
      states();
    });

  };
});
