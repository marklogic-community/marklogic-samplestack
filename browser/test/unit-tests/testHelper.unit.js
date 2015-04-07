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

define(['jquery'], function ($) {
  var helper = {};

  helper.postCoverage = function (coverage, cb) {
    $.ajax({
      type: 'POST',
      url: '/coverage/reset'
    })
    .done(function () {
      // console.log('cleared coverage');
      $.ajax({
        type: 'POST',
        url: '/coverage/client',
        data: JSON.stringify(coverage),
        contentType: 'application/json'
      }).done(function () {
        // console.log('reported coverage');
        cb();
      });
    });
  };

  helper.getTestableController = function (
    $injector,
    controllerName,
    injected
  ) {
    var resp = {};

    resp.$rootScope = $injector.get('$rootScope');
    resp.$scope = resp.$rootScope.$new();
    var $controller = $injector.get('$controller');
    resp.controller = $controller(
      controllerName,
      _.merge({$scope: resp.$scope }, injected)
    );
    return resp;
  };

  /**
   * Create/replace  a function on a stub that will return promise a promise.
   * A provided handle is supplied with a deferred object that it can resolve.
   * @param  {angular.$q} $q
   * @param  {Object} stubObj Object on which to create the function,  If
   * falsy, an object is generated.
   * @param  {string} funcName Name of tghe function to create/replace
   * @param  {Object} deferredHandle object on which to assign a deferreda.
   * @return {Object} The stub.
   */
  helper.stubPromiseDeferred = function (
    $q, stubObj, funcName, deferredHandle
  ) {
    var deferred = $q.defer();
    var promise = deferred.promise;
    var stub = sinon.stub(stubObj, funcName).returns(promise);
    deferredHandle.deferred = deferred;
    return stub;
  };

  /**
   * Create/replace  a function on a stub that will return promise a promise.
   * The promise resolves to a specified value.
   * @param  {angular.$q} $q
   * @param  {Object} stubObj Object on which to create the function,  If
   * falsy, an object is generated.
   * @param  {string} funcName Name of tghe function to create/replace
   * @param  {*} value The value to which the promise should reslove
   * @return {Object} The stub.
   */
  helper.stubPromiseValue = function (
    $q, stubObj, funcName, value
  ) {
    var dh = {};
    var stub = helper.stubPromiseDeferred($q, stubObj, funcName, dh);
    dh.resolve(value);
    return stub;
  };

  helper.setExpectCsrf = function ($httpBackend, omitCsrf) {
    var withCsrf = { 'X-CSRF-TOKEN': 'some token' };
    if (omitCsrf) {
      $httpBackend.expectGET('/v1/session').respond(200);
    }
    else {
      $httpBackend.expectGET('/v1/session').respond(200, null, withCsrf);
    }
  };

  return helper;

});
