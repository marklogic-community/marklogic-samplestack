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
  '_marklogic/module'
], function (
  module
) {

  var merge = function (dst) {
    angular.forEach(arguments, function (obj) {
      if (obj !== dst) {
        angular.forEach(obj, function (value, key) {
          if (dst[key] &&
              dst[key].constructor &&
              dst[key].constructor === Object
          ) {
            merge(dst[key], value);
          }
          else {
            dst[key] = value;
          }
        });
      }
    });
    return dst;
  };

  /**
   * @ngdoc service
   * @name mlUtil
   *
   * @description
   * Provides utility objects and methods.
   *
   * @property {object} moment This is
   * <a href="http://momentjs.com/" target="_blank">
   * Moment.js</a>. It is used to handle conversion between dates,
   * in particular between ISO 8601 strings from JSON and Javascript
   * Date objects.
   *
   * It is also used by mlModel elements when serializing and deserializing
   * JSON dates for $http.
   *
   * Until time zone handling is fully implemented, this instance of moment
   * is configured to operate entirely and execlusively in UTC mode.
   */

  module.value('mlUtil', {

    moment: window.moment,

    /**
     * @ngdoc method
     * @name mlUtil#objectify
     * @param {object} obj Any object
     * @returns {object} a "plain old Javascript" version of the object
     * @description Converts and object to a "plain-old JavaScript object"
     * by converting it to JSON and then back to an object. This causes
     * the results of serialization to JSON to be found in the resulting object.
     * For instance, dates will be serialized to strings. Additionally,
     * non-enumerable properties are dropped in the resulting object.
     *
     * Does not modify its parameter.
     *
     * This method is used when validating {@link mlModelBase}-derived objects.
     */
    objectify: function (obj) {
      // TODO: this is cheap and dirty
      return angular.fromJson(angular.toJson(obj));
    },


    /**
     * @ngdoc method
     * @name mlUtil#merge
     * @param {object} targetObject The first object is the ultimate target
     * of the merge(s).
     * @param {object} objectToMerge an object to merge into the target
     * @param {...*} remainingArgs additional objects to merge
     * @returns {object} Reference to the first object in the parameters list,
     * which is the ultimate target of the merge(s).
     * @description
     * This is a deep merge. Objecgts are merged from right to left, so the
     * last on is merged into the second to last and ultimately the first
     * object in the parameters list is the final target. These merges occur
     * on the actual objects, so if targets of these marges are not intended
     * to be modified, clones should be used.
     *
     * This is similar to [lodash's merge
     * function](http://lodash.com/docs#merge).
     */
    merge: merge
  });

});
