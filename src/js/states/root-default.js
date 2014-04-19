define(['./root'], function(parent) {
  return parent.addChild('default', {
    url: ''
  });
});
/* A BETTER WAY */

/**
 * A state named myStateName.  The dependency on services/someServices
 * allows unit testing such that we always have the pieces of our code
 * necessary when we test an individual module.  Notice that this module
 * declares a dependency on someService.  This enables some good organizational
 * principles around tracking dependenies, drawing graphs of dependencies
 * and targeted, live testing of code changes.
 */
/*
define(['./myParentState', 'services/someService'],
  function(parent) {
    return parent.addChild('myStateName', {
      // since we do nothing special, we get the templateUrl for free based
      // on the state name... this is in the StateDef constructor
      url: 'someUrlFragment',
      controller: function($scope, someService) {
        someService.getMyVvalue().then(
          function success(theValue) {
            $scope.theValue = theValue;
          },
          function fail(err) {
            console.log(err);
          }
        );
      }
      // additional ui-router properties or custom properties could be
      // added here
    });
  }
);
*/
