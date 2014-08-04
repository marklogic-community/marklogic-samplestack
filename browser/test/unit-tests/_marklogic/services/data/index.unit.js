define([
  './mlHttpInterceptor.unit',
  './mlModelBase.unit',
  './mlSchema.unit',
  './mlWaiter.unit'
], function (
  mlHttpInterceptor,
  mlModelBase,
  mlSchema,
  mlWaiter
) {
  return function () {
    describe('data', function () {
      mlHttpInterceptor();
      mlModelBase();
      mlSchema();
      mlWaiter();
    });
  };
});
