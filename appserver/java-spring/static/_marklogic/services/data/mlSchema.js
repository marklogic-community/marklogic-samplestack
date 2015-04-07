/* 
 * Copyright 2012-2015 MarkLogic Corporation 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */ 

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
   * `mlSchema` is used by `mlModelBase` and its derivatives to define
   * and test validity of instances against JSON Schemas.
   *
   * Typically an application interacts with mlSchema directly only when
   * inheriting from mlModelBase.
   *
   * There is no aspect of mlSchema that pro-actively forces objects
   * to be valid. Rather, it can be and is used to determine object
   * validity at key points in the application. Through mlModelBase
   * implementation, it can be used to drive user-interface feedback
   * for users to inform them of whether or not certain properties of an
   * object are valid.
   */

  module.factory('mlSchema', [

    function (
    ) {

      // for now this turns out to be a super-thin layer on jsonschema,
      // but this is here for potential extensions as we evolve the proj.
      var validator = new jsonschema.Validator();

      return {
        /**
         * @ngdoc method
         * @name _marklogic.mlSchema#addSchema
         * @param {object} schema Representation of a JSON Schema as defined
         * by [the tdegrunt/jsonschema](https://github.com/tdegrunt/jsonschema)
         * library. This Node.js-based library is built into
         * the application via [browserify](http://browserify.org/).
         * @returns {object} the jsonschema object that has been added to the
         * set
         * of schema
         * @description Adds the given schema to the application-global set of
         * shcemas. A schema is valid if it follows the syntax
         * specified by the jsonschema library, which by-and-large supports v4
         * of JSON
         * Schema. As such, at a minimum, one must specify a valid JSON Pointer
         * for the id property. All other aspects of the schema are optional.
         *
         * To effectively not leverage JSON Schema for validation, simply pass
         * a literal with such an id property. Otherwise, specify those
         * attributes of the schema that should be used to determine validity.
         */
        addSchema: function (schema) {
          validator.addSchema(schema);
          return validator.schemas[schema.id];
        },

        /**
         * @ngdoc method
         * @name _marklogic.mlSchema#validate
         * @param {object} instance An object to validate
         * @param {string} $ref JSON Pointer to a schema against which to
         * validate the given instance
         * @returns {object} validation results as specified by the
         * jsonschema library
         * @description Validates an instance against a defined schema.
         */
        validate: function (instance, $ref) {
          return validator.validate(instance, { $ref: $ref });
        }
      };
    }

  ]);
});
