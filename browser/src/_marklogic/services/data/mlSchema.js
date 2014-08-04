define([
  '_marklogic/module', './_jsonschema.browserify'
], function (module, jsonschema) {

  /**
   * @ngdoc service
   * @name mlSchema
   *
   * @description
   * Manages JSON schemas and enables validation of instances against
   * the schema.
   *
   * More TODO
   */

  module.factory('mlSchema', [

    function (
    ) {

      // for now this turns out to be a super-thin layer on jsonschema,
      // but this is here for potential extensions as we evolve the proj.
      var validator = new jsonschema.Validator();

      return {
        addSchema: function (schema) {
          validator.addSchema(schema);
          return validator.schemas[schema.id];
        },
        validate: function (instance, $ref) {
          return validator.validate(instance, { $ref: $ref });
        }
      };
    }

  ]);
});
