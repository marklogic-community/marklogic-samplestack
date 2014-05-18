(function (undefined) {

  var should = this.should;
  describe('marklogic/services/schema', function () {

    var sut;

    beforeEach(function (done) {
      module('marklogic.svc.schema');
      inject(
        function (mlSchema) {
          sut = mlSchema;
          done();
        }
      );
    });

    it('should expose jsonschema.Validator', function () {
      should.exist(sut.SchemaValidator);
    });
  });


}).call(global);
