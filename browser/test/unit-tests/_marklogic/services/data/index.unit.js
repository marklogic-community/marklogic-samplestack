define([
  './mlHttpInterceptor.unit',
  './mlModelBase.unit',
  // './mlModelFactory.unit',
  // './mlModelSpec.unit',
  './mlSchema.unit',
  './mlWaiter.unit'
], function (
  mlHttpInterceptor,
  mlModelBase,
  // mlModelFactory,
  // mlModelSpec,
  mlSchema,
  mlWaiter
) {
  return function () {
    describe('data', function () {
      mlHttpInterceptor();
      mlModelBase();
      // mlModelFactory();
      // mlModelSpec();
      mlSchema();
      mlWaiter();
    });
  };
});
