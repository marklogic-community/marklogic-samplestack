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
_marklogic/services/model/mlModel.js
 */

define(['_marklogic/module'], function (module) {

  /**
   * @ngdoc service
   * @name mlModelBase
   * @requires mlSchema
   * @requires mlUtil
   * @requires mlWaiter
   *
   * @description
   * Service from which domain-specific model elements are derived.
   *
   * The `mlModelBase` service is primarily a means to derive domain-specific
   * services that can themselves create and manage instances of model objects.
   *
   * Domain objects derived from mlModel base are found in the <a
   * href="/marklogic-samplestack/api/_marklogic/domain">_marklogic/domain</a>
   * and
   * <a href="/marklogic-samplestack/api/app/domain">app/domain</a> directories.
   *
   * The model objects spawned by these domain-specific services
   * have features to assist in validating, tracking and managing model data
   * exhcnage with a server. In addition, specifc directives may provide
   * additinal features by binding to these object.
   *
   * The Samplestack application uses mlModelBase to define domain objects
   * which:
   *
   * - can be validated for schema-level errors (such as presence of a property
   * of the correct type and bounds) using JSON Schema via {@link mlSchema};
   * - have facilities for being used with REST endpoints, including endpoints
   * that require "tweaks", such as changing endpoint names for certain HTTP
   * methods, or overriding what is sent to the server or how responses from
   * the server are processed;
   * - provide metadata about their status while HTTP methods are *in progress*
   * using {@link mlWaiter}.
   *
   * Some of the primary reasons for mlModelBase are consistency, error
   * reduction
   * and thorough testing. By centralizing the code that handles common issues
   * associated with model elements (the "M" in MVC). By centralizing the
   * key behaviors of model elements, more attention can be paid to ensuring
   * quality in the generic functionality, and there is both less room for
   * error in individual elements, as well as less effort required to define
   * them.
   *
   * The principle of doing it right once, making components testable (and
   * testing them well) is one
   * key to getting the most out of AngularJS.
   *
   * This `mlModelBase` object certainly does not solve all problems, but it
   * allows Samplestack to have such centralized functionality in one
   * object that can be extended as requirements change.
   *
   * In Angular 2.0, which is currently being designed, plans are forming to
   * implement a lot of this functionality within Angular's Data module. There
   * are also other publicly available libraries that try to solve some of these
   * issues in various ways, but generally each requires a level of buy-in which
   * locks in certain behaviors. In order to maintain flexibility, and until
   * Angular 2.0's data module can be evaluated for incproration, this
   * customized solution has been developed for Samplestack. The development
   * team looks forward to future developments in this space which might help
   * to lessen the amount of custom code.
   *
   * It should be noted that most of this service is about providing a
   * **default** implementation of a model element, where instances use
   * prototype methods which can and are expected to be overriden in specific
   * model objects.  For example, a model object may want to override the hook
   * that handles processing responses from the server for POSTs using the
   * by specifying such an override of the `onResponsePOST` method.
   *
   * <p style="color: red">
   * **TODO** the current version of this object  makes documentation difficult
   * because of the way that
   * instances are defined -- that is, there is no Angular component associated
   * with instances of mlModelBase, and such no good place, in Angular terms,
   * to put documentation.
   * </p>
   *
   * <p style="color: red">
   * **For this reason, and to improve overall clarity of the code,
   * the mlModelBase object is presently being refactored.** Expect the next
   * revision to have more and clearer documentation, where both the services
   * that manage mlModel elements _and_ the instances are documented.
   * </p>
   */
  module.factory('mlModelBase', [

    '$http', '$q','$parse', '$injector', 'mlSchema', 'mlUtil', 'mlWaiter',
    '$timeout',
    function (
      $http, $q, $parse, $injector, mlSchema, mlUtil, mlWaiter, $timeout
    ) {

      /**
       * @ngdoc property
       * @name _marklogic.mlModelBase#object
       * @type {function}
       * @description This is the constructor that creates instances of
       * a given mlModelBase-derived object. It is configured when the
       * derivation is defined. The default implementation is:
       *
       * ```javascript
       * self.preconstruct(spec, parent);
       * Object.defineProperty(this, '$ml', {
       *   value: { parent: parent }
       * });
       * self.assignData(spec || {}, parent);
       * self.postconstruct(spec, parent);
       * ```
       */
      var MlModel = function (spec, parent) {

        this.preconstruct(spec, parent);
        Object.defineProperty(this, '$ml', {
          value: { parent: parent }
        });
        this.assignData(spec || {}, parent);
        this.postconstruct(spec, parent);
      };


      MlModel.prototype.preconstruct = function (spec, parent) {
      };
      MlModel.prototype.postconstruct = function (spec, parent) {
      };

      MlModel.prototype.getBaseUrl = function () {
        return '/v1'; // TODO should come from config setting
      };

      MlModel.prototype.attachScope = function (scope, as) {
        var self = this;
        scope[as] = self;
        this.$ml.unregisterScopeWatcher = scope.$watch(
          as,
          function () {
            self.testValidity();
          },
          true
        );
        self.testValidity();
      };

      MlModel.prototype.getResourceId = function () {
        return this.$mlSpec.schema.id;
      };

      MlModel.prototype.getResourceName = function (httpMethod) {
        var resId = this.getResourceId();
        return resId.substring(resId.lastIndexOf('#') + 1);
      };

      MlModel.prototype.getHttpHeaders = function (httpMethod) {
        return undefined;
      };

      MlModel.prototype.onResponseGET = function (data) {
        this.assignData(data);
      };

      MlModel.prototype.onResponsePOST = function (data) {
        // we expect back an id in the body, so a merge should be good
        // in some cases, this isn't what we want but such model
        // derivations should override it
        this.mergeData(data);
      };

      MlModel.prototype.onResponsePUT = function (data) {
        this.mergeData({});
      };

      MlModel.prototype.onResponseDELETE = function (data) {
        // do nothing with responses to DELETE;
      };

      /**
       * @ngdoc method
       * @name MlModel#prototype.assignData
       * @description Assigns properties to model object. First deletes any
       * existing properties.
       * @param {object} data Data to merge.
       */
      MlModel.prototype.assignData = function (data) {
        var self = this;
        angular.forEach(self, function (val, key) {
          delete self[key];
        });
        self.mergeData(data);
      };

      /**
       * @ngdoc method
       * @name MlModel#prototype.mergeData
       * @description Merges new data into model object properties. Any
       * existing data is retained.
       * @param {object} data Data to merge.
       */
      MlModel.prototype.mergeData = function (data) {
        mlUtil.merge(this, data);
        this.testValidity(); // Based on schema, sets $ml validity flags
      };

      MlModel.prototype.onHttpResponse = function (
        data, httpMethod, additionalResolves
      ) {
        switch (httpMethod) {
          case 'PUT':
            this.onResponsePUT(data, additionalResolves);
            break;
          case 'DELETE':
            this.onResponseDELETE(data, additionalResolves);
            break;
          case 'POST':
            this.onResponsePOST(data, additionalResolves);
            break;
          case 'GET':
            this.onResponseGET(data, additionalResolves);
            break;
          default:
            throw new Error(
              'unsupported method passed to onHttpResponse: ' + httpMethod
            );
        }
        this.testValidity();
      };

      MlModel.prototype.specFromArguments = function () {
        // most override if anything other wanting the first parameter
        // to be mapped to id
        return {
          id: arguments[0]
        };
      };

      MlModel.prototype.getEndpointIdentifier = function (httpMethod) {
        return '/' + this.id;
      };

      /**
       * @ngdoc method
       * @name MlModel#prototype.getHttpUrl
       * @description Returns URL string for accessing REST endpoint based
       * on HTTP method.
       * @param {string} httpMethod HTTP method.
       */
      MlModel.prototype.getHttpUrl = function (httpMethod) {
        switch (httpMethod) {
          case 'PUT':
          case 'DELETE':
          case 'GET':
            return '/' + this.getResourceName(httpMethod) +
            this.getEndpointIdentifier(httpMethod);
          case 'POST':
            return '/' + this.getResourceName(httpMethod);
          default:
            throw new Error(
              'unsupported http method passed to getEndpoint: ' + httpMethod
            );
        }
      };

      MlModel.prototype.getHttpDataPUT = function () {
        return this;
      };

      MlModel.prototype.getHttpDataPOST = function () {
        return this;
      };

      MlModel.prototype.getHttpDataGET = function () {
        return undefined;
      };

      MlModel.prototype.getHttpDataDELETE = function () {
        return undefined;
      };

      /**
       * @ngdoc method
       * @name MlModel#prototype.getHttpData
       * @description Returns data payload to be set to REST endpoint based
       * on HTTP method.
       * @param {string} httpMethod HTTP method.
       */
      MlModel.prototype.getHttpData = function (httpMethod) {
        switch (httpMethod) {
          case 'PUT':
            return this.getHttpDataPUT();
          case 'POST':
            return this.getHttpDataPOST();
          case 'GET':
            return this.getHttpDataGET();
          case 'DELETE':
            return this.getHttpDataDELETE();
          default:
            throw new Error(
              'unsupported http method passed to getHttpData: ' + httpMethod
            );
        }
      };

      MlModel.prototype.getHttpMethodOverride = function (httpMethod) {
        return httpMethod;
      };

      MlModel.prototype.getHttpConfig = function (httpMethod) {
        var config = {
          url: this.getHttpUrl(httpMethod),
          method: this.getHttpMethodOverride(httpMethod),
          data: this.getHttpData(httpMethod),
        };

        var headers = this.getHttpHeaders(httpMethod);
        if (headers) {
          config.headers = headers;
        }

        return config;
      };

      var dedate = function (obj) {
        var newObj = angular.copy(obj);
        angular.forEach(newObj, function (val, key) {
          if (val) {
            if (val.toJSON) {
              newObj[key] = val.toJSON();
            }
            else {
              if (typeof newObj[key] === 'object') {
                newObj[key] = dedate(newObj[key]);
              }
            }
          }
        });
        return newObj;
      };

      MlModel.prototype.validateObject = function (obj) {
        return mlSchema.validate(
          angular.fromJson(angular.toJson(obj)),
          this.$mlSpec.schema.id
        );
      };

      MlModel.prototype.testValidity = function () {
        this.$ml.validation = this.validateObject(this);
        this.$ml.invalid = !(
            this.$ml.valid = this.$ml.validation.errors.length === 0
        );
      };

      MlModel.prototype.sortedValidationErrors = function () {
        var errors = {};
        // if (this.$ml.validation.errors) {
        angular.forEach(this.$ml.validation.errors, function (error) {
          var jsonErrorPath = error.property;
          var normalized = jsonErrorPath.indexOf('.') > 0 ?
              jsonErrorPath.substr(9) :
              '';

          if (!errors[normalized]) {
            errors[normalized] = [];
          }
          errors[normalized].push(error);
        });
        // }
        return errors;
      };

      MlModel.prototype.errors = function (property) {
        var errs = this.sortedValidationErrors();
        return errs[property] || [];
      };

      MlModel.prototype.propertyValid = function (property) {
        return this.errors(property).length === 0;
      };

      MlModel.prototype.getStateParams = function () {
        throw new Error('not implemented'); // override this to use it
      };

      MlModel.prototype.assignStateParams = function (stateParams) {
        throw new Error('not implemented');  // override this to use it
      };

      MlModel.prototype.http = function (httpMethod, promises) {
        var self = this;
        if (!promises) {
          promises = [];
        }
        var httpConfig = this.getHttpConfig(httpMethod);
        httpConfig.timeout = 60000;
        var waiter = mlWaiter.waitOn(this);
        httpConfig.url = this.getBaseUrl() + httpConfig.url;
        promises.unshift($http(httpConfig));


        // after normal timeout plus one second, timeout manually because
        // angular lost track of the promise (IE9 hack)
        var aborter = $q.defer();
        aborter.requestComplete = false;
        var waitForThis = $timeout(function () {
          if (!aborter.requestComplete) {
            throw new Error(
              '$http operation seems to have timed out (and Angular may have ' +
              'lost the promise due to IE9 incompatibility?)'
            );
          }
        }, httpConfig.timeout + 1000);

        $q.all(promises).then(
          function (results) {
            $timeout.cancel(waitForThis);
            aborter.requestComplete = true;
            self.onHttpResponse(
              results[0].data,
              httpMethod,
              results.slice(1)
            );
            waiter.resolve();
          },
          function (results) {
            $timeout.cancel(waitForThis);
            aborter.requestComplete = true;
            waiter.reject(results);
          }
        );
        return self;
      };

      MlModel.prototype.post = function () {
        return this.http('POST');
      };

      MlModel.prototype.put = function () {
        return this.http('PUT');
      };

      MlModel.prototype.getOne = function () {
        return this.http('GET');
      };

      MlModel.prototype.del = function () {
        return this.http('DELETE');
      };

      MlModel.prototype.getService = function () {
        return $injector.get(this.$mlSpec.serviceName);
      };


      var svc = {};

      svc.object = MlModel;

      svc.extend = function (name, constructor, serviceName) {
        var protoProp;
        angular.forEach(
          constructor.prototype,
          function (protoProp, protoName) {
            if (typeof protoProp !== 'function' && protoName !== '$mlSpec') {
              throw new Error(
                'mlModel prototypes may only contain functions. ' +
                    'Illegal prototype property: ' + protoName
              );
            }

          }
        );

        var svcImplementation = {};
        svcImplementation.object = constructor;

        /**
         * @ngdoc method
         * @name _marklogic.mlModelBase#create
         * @param {?Object} spec If specified, the parameter is an initial
         * value for the object.
         * @returns {object} the created instance
         *
         * @description Creates an instance of the
         * mlModelBase-derived object.
         *
         * The default implementation calls the `object` constructor.
         */
        svcImplementation.create = function (spec, parent) {
          var temp = {};
          temp[name] = svcImplementation.object;
          return new temp[name](spec, parent);
        };

        svcImplementation.ensureInstance = function (spec) {
          if (typeof spec !== 'object') {
            spec = svcImplementation.object.prototype.specFromArguments
                .apply(null, arguments);
          }
          return spec instanceof svcImplementation.object ?
              spec :
              svcImplementation.create(spec);
        };

        /**
         * @ngdoc method
         * @name _marklogic.mlModelBase#getOne
         * @param {object} spec Either an existing instance to (re-)fetch, or
         * a plain object that otherwise uniquely specifies an instance
         * of the element.
         * @returns {object} The instance. Because instances expose their
         * http=-related status in their $ml metadata property, it may be used
         * to follow progress through the promise via `[instance].$ml.waiting`,
         * as managed by the {@link mlWaiter} service..
         *
         * @description Fetches a single instance from the server (using GET),
         * based on the specified criteria.
         *
         * The default implementation either uses the spec as the instance
         * whose data should be fetched, or, if the spec isn't already an
         * instance of the model element, it creates one based on the spec.
         *
         * This means that one can pass either an existing instance of the
         * model element **or** pass a specification, such as an object
         * containing an `id` property, to specify what data to fetch.
         */
        svcImplementation.getOne = function (spec) {
          return svcImplementation.ensureInstance(spec).getOne();
        };

        /**
         * @ngdoc method
         * @name _marklogic.mlModelBase#post
         * @param {object} spec Either an existing instance to post, or
         * a plain object whose data should be used to create an instance prior
         * to posting.
         * @returns {object} The instance. Because instances expose their
         * http=-related status in their $ml metadata property, it may be used
         * to follow progress through the promise via `[instance].$ml.waiting`,
         * as managed by the {@link mlWaiter} service..
         *
         * @description POSTs an instance of the model element to the server.
         *
         * The default implementation merges the response from the server
         * into the instance.
         *
         * The default implementation either uses the spec as the instance
         * whose data should be posted, or, if the spec isn't already an
         * instance of the model element, it creates one based on the spec.
         *
         * This means that one can pass either an existing instance of the
         * model element **or** pass a specification of data that should be
         * used to create a new instance prior to posting.
         */
        svcImplementation.post = function (spec) {
          return svcImplementation.ensureInstance(spec).post();
        };

        /**
         * @ngdoc method
         * @name _marklogic.mlModelBase#del
         * @param {object} spec Either an existing instance to delete, or
         * a plain object whose data should be used to specify the instance for
         * deletion.
         * @returns {angular.Promise} promise to be resolved when the deletion
         * is complete
         * or rejected when/if it fails.
         *
         * @description DELETEs an instance of the model element froom the
         * server.
         *
         * The default implementation merges the response from the server
         * into the instance.
         *
         * The default implementation either uses the spec as the instance
         * whose data should be posted, or, if the spec isn't already an
         * instance of the model element, it creates one based on the spec.
         *
         * This means that one can pass either an existing instance of the
         * model element **or** pass a specification of data that should be
         * used to create a new instance prior to posting.
         */
        svcImplementation.del = function (spec) {
          var deferred = $q.defer();
          var instance = svcImplementation.ensureInstance(spec);
          instance.del().$ml.waiting.then(
            deferred.resolve, deferred.reject
          );
          return deferred.promise;
        };

        return svcImplementation;
      };

      return svc;
    }
  ]);
});
