(function (undefined) {
  var _jsonschema_ = this.jsonschema;

  var module = this.angular.module(
    'marklogic.svc.schema', []
  );

  var MLSchema = function () {
    var jsonschema = _jsonschema_;

    this.SchemaValidator = jsonschema.Validator;
  };

  module.factory(

    'mlSchema', [

      function () {
        return new MLSchema();

      } // factory func
    ] // injector shorthand
  ); //module.factory

}).call(global);
