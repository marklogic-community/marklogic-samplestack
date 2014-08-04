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
   */

  module.value('mlUtil', {
    /**
     * @ngdoc property
     * @name mlUtil#moment
     * @type {object}
     * @description
     * This is <a href="http://momentjs.com/" target="_blank">
     * Moment.js</a>. It is used to handle conversion between dates,
     * in particular between ISO 8601 strings from JSON and Javascript
     * Date objects.
     *
     * It is also used by mlModel elements when serializing and deserializing
     * JSON dates for $http.
     */
    moment: moment,

    /**
     * @ngdoc property
     * @name mlUtil#merge
     * @description
     * This is a deep merge.
     */
    merge: merge
  });

});
