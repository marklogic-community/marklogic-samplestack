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

  helper.stubPromise = function ($q, theObj, methodName, value) {
    var deferred = $q.defer();
    var promise = deferred.promise;
    var stub = sinon.stub(theObj, methodName).returns(promise);
    deferred.resolve(value);
    return stub;
  };

  window.myTest = helper;

})(window.appContext);
