define(['./_root', 'directives/version'], function(parent) {

  var state = {
    name: '_defaultLayout',
    definition: {
      abstract: true,
      childNamePrefix: '',
      controller: function($scope) {
        $scope.collapsed = true;

      }
    }

  };

  return parent.addChild(state.name, state.definition);
});
