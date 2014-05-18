(function (undefined) {
  var helper = {};

  helper.getTestableController = function ($injector, sut, injected) {
    var resp = {};

    resp.$rootScope = $injector.get('$rootScope');
    resp.$scope = resp.$rootScope.$new();
    var $controller = $injector.get('$controller');
    resp.controller = $controller(
      sut.controller,
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

  this.testHelper = helper;

}).call(global);
