(function (undefined) {

  var module = this.angular.module(
    'marklogic.svc.waiter', []
  );

  module.factory(

    'mlWaiter', [

      '$q',
      function ($q) {
        var svc = {};

        var parseArgs = function (args) {
          var spec = {
            workers: [],
            fallback: null
          };
          if (args.length === 2) {
            //base case -- one item and no fallback
            spec.workers.push({
              promise: args[0],
              scopeObj: args[1]
            });
          }

          return spec;

        };

        var run = function (spec) {
          spec.workers.forEach(function (worker, index) {
            if (!worker.promise.then) {
              // it's not really a promise -- it must be the value
              throw new Error('not implemented -- handled a non-promise');
            }
            else {
              delete worker.scopeObj.$mlError;
              worker.scopeObj.$mlWaiting = true;
              var workerSuccess = function (result) {
                worker.scopeObj.value = result;
                delete worker.scopeObj.$mlWaiting;
              };
              var workerFailure = function (reason) {
                worker.scopeObj.$mlError = reason;
                delete worker.scopeObj.$mlWaiting;
              };

              worker.promise.then(
                workerSuccess,
                workerFailure
              );
            }

          });

          if (!spec.fallback) {
            spec.fallback = function (reason) {
              throw new Error(
                'mlWaiter: default fallback not implemented. ' +
                    'Error: \'' + JSON.stringify(reason)) + '\'';
            };
          }

        };

        svc.waitFor = function () {
          var spec = parseArgs(Array.prototype.slice.call(arguments));

          run(spec);
        };

        return svc;

      } // factory func
    ] // injector shorthand
  ); //module.factory

}).call(global);
