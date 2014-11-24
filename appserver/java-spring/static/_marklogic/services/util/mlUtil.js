define([
  '_marklogic/module',
  'moment'
], function (
  module,
  moment
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

    moment: moment.utc,

    /**
     * @ngdoc method
     * @name mlUtil#stripZone
     * @param {object} dateish A JavaScript or `moment` date object
     * @returns {string} an ISO8601 string representing the date, with time
     * zone
     * information removed.
     *
     * This function will be unnecessary when time zones and date string
     * handling is fully implemented. For now, it is used to ensure that the
     * middle tier doesn't get ISO8601 time zone information that it cannot
     * process.
     */
    stripZone: function (dateish) {
      return dateish.toISOString().replace(/Z.*$/, '');
    },

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
