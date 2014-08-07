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
   * Service from which domain-specific model elements iare derived.
   *
   * The `mlModelBase` service is primarily a means to derive domain-specific
   * services that can themselves create and manage model objects.
   *
   *  The model objects spawned by these domain-specific services
   * have features to assist in validating, tracking and managing model data
   * exhcnage with a server. In addition, specifc directives may provide
   * additinal features by binding to these object.
   *
   * More TODO
   */

  module.factory('mlModelBase', [

    '$http', '$q','$parse', 'mlSchema', 'mlUtil', 'mlWaiter',
    function (
      $http, $q, $parse, mlSchema, mlUtil, mlWaiter
    ) {
      var self = this;
      this.baseUrl = '/v1';

      // MlModel prototype obj

      var MlModel = function (spec) {
        this.preconstruct(spec);
        Object.defineProperty(this, '$ml', {
          value: {}
        });
        this.assignData(spec || {});
        this.postconstruct(spec);
      };

      MlModel.prototype.preconstruct = function (spec) {
      };
      MlModel.prototype.postconstruct = function (spec) {
      };

      MlModel.prototype.attachScope = function (scope, as) {
        var self = this;
        scope[as] = this;
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
        // we normally consider it an error if delete has a body
        if (data && Object.keys(data).length) {
          throw new Error('don\'nt assign data on DELETE');
        }
      };

      MlModel.prototype.assignData = function (data) {
        angular.forEach(this, function (val, key) {
          delete this[key];
        });
        mlUtil.merge(this, data);
        this.testValidity();
      };

      MlModel.prototype.mergeData = function (data) {
        mlUtil.merge(this, data);
        this.testValidity();
      };

      MlModel.prototype.onHttpResponse = function (data, httpMethod) {
        switch (httpMethod) {
          case 'PUT':
            this.onResponsePUT(data);
            break;
          case 'DELETE':
            this.onResponseDELETE(data);
            break;
          case 'POST':
            this.onResponsePOST(data);
            break;
          case 'GET':
            this.onResponseGET(data);
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
        var own = {};
        Object.getOwnPropertyNames(obj).reduce(
          function (dummy, key) {
            own[key] = obj[key];
          }
        );
        return mlSchema.validate(dedate(own), this.$mlSpec.schema.id);
      };

      MlModel.prototype.testValidity = function () {
        this.$ml.validation = this.validateObject(this);
        this.$ml.invalid = !(
            this.$ml.valid = this.$ml.validation.errors.length === 0
        );
      };

      MlModel.prototype.sortedValidationErrors = function () {
        var self = this;
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

      var http = function (instance, httpMethod) {
        var httpConfig = instance.getHttpConfig(httpMethod);
        httpConfig.timeout = 3000;
        var waiter = mlWaiter.waitOn(instance);
        httpConfig.url = self.baseUrl + httpConfig.url;
        $http(httpConfig).then(
          function (response) {
            instance.onHttpResponse(response.data, httpMethod);
            waiter.resolve();
          },
          function (err) {
            waiter.reject(err);
          }
        );
        return instance;
      };

      MlModel.prototype.post = function () {
        return http(this, 'POST');
      };

      MlModel.prototype.put = function () {
        return http(this, 'PUT');
      };

      MlModel.prototype.getOne = function () {
        return http(this, 'GET');
      };

      MlModel.prototype.del = function () {
        return http(this, 'DELETE');
      };

      var svc = {};

      svc.object = MlModel;

      svc.extend = function (name, constructor) {

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
        svcImplementation[name] = constructor;
        svcImplementation.object = constructor;

        svcImplementation.create = function (spec) {
          return new svcImplementation[name](spec);
        };

        var ensureInstance = function (spec) {
          if (typeof spec !== 'object') {
            spec = constructor.prototype.specFromArguments
                .apply(null, arguments);
          }
          return spec instanceof constructor ?
              spec :
              svcImplementation.create(spec);
        };

        svcImplementation.getOne = function (spec) {
          return ensureInstance(spec).getOne();
        };

        svcImplementation.post = function (spec) {
          return ensureInstance(spec).post();
        };

        svcImplementation.del = function (spec) {
          var deferred = $q.defer();
          var instance = ensureInstance(spec);
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
