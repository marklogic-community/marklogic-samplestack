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

/*
this is provisional -- to be refactored to follow basic patterns that
Angular 2.0 is pointing towards where we're doing the same thing they are
planning to put into core -- this may mean that mlWaiter is factored into
something that looks more like Angular's ChangeEvent and oorresponding hooks
in models and the store.
 */
define(['_marklogic/module'], function (module) {

  /**
   * @ngdoc service
   * @name mlWaiter
   *
   * @description
   * Establishes promise-based properties under the non-enumerable $ml property
   * of model objects such that template code may track the status of promises
   * (usually related to $http requests) that affect the model element instance.
   *
   * When a promise is in progress, the `$ml.waiting` property returns a promise
   * of its own which is resolved when the underlying worker promise is
   * resolved.
   *
   * If the underlying promise is resolved, the $ml.waiting promise is resolved
   * too, and then the waiting property is deleted.
   *
   * If the underlying promise is rejected, an $ml.error property is created
   * to store the error information from the underlying promise, and the
   * $ml.waiting property is deleted.
   *
   * There are no special requirements on the object, but if it
   * does not have a **non-enumerable** `$ml` property, then a
   * **non-enumerable** one is created for tracking purposes.
   *
   * This example below is taken from {@link mlModelBase}.
   *
   * ```javascript
   *     var http = function (instance, httpMethod) {
   *       var httpConfig = instance.getHttpConfig(httpMethod);
   *       var waiter = mlWaiter.waitOn(instance);
   *       httpConfig.url = self.baseUrl + httpConfig.url;
   *       $http(httpConfig).then(
   *         function (response) {
   *           instance.onHttpResponse(response.data, httpMethod);
   *           waiter.resolve();
   *         },
   *         function (err) {
   *           waiter.reject(err);
   *         }
   *       );
   *       return instance;
   *     };
   * ```
   *
   * In practice, an application will frequently use the properties managed
   * by mlWaiter when conducting HTTP-based operations on model elements.
   *
   * Example:
   *
   * ```javascript
   * myElement.post().$ml.waiting.then(
   *   function () {
   *     // the post is completed
   *   }
   * );
   * ```
   * In a template, the same property can be used to visually indicate that an
   * http method is in progress.
   *
   * Example:
   *
   * ```html
   * <div ng-if="$ml.waiting">
   *   we are waiting for a round trip with the server
   * </div>
   * ```
   *
   */
  module.factory('mlWaiter', [
    '$q',
    function ($q) {
      return {

        /**
         * @ngdoc method
         * @name mlWaiter#waitOn
         * @param {object} objectInstance The object that is the subject of
         * the
         * promise.
         * @returns {angular.Deferred} to be used by the caller to signal
         * to mlWaiter that the underlying promise is either resolved or
         * rejected.
         */
        waitOn: function (objectInstance) {
          if (!objectInstance.$ml) {
            Object.defineProperty(objectInstance, '$ml', {
              value: {}
            });
          }
          delete objectInstance.$ml.error;

          // this one is for anyone who wants to watch it, it will
          // disappear on its own if nobody does so;
          var myDeferred = $q.defer();
          objectInstance.$ml.waiting = myDeferred.promise;

          // this one is for me to be notified when things are finished
          // one way or the other.
          var mySignal = $q.defer();
          mySignal.promise.then(
            function () {
              delete objectInstance.$ml.waiting;
              myDeferred.resolve(objectInstance);
            },
            function (reason) {
              objectInstance.$ml.error = reason;
              delete objectInstance.$ml.waiting;
              myDeferred.reject(reason);
            }
          );
          return mySignal;
        }
      };
    }
  ]);
});
