define(['./_StateDef', 'angular'], function(StateDef, ng) {

  return new StateDef(null, '_root', {
    abstract: true,
    url: '',
    childNamePrefix: '',
    controller: function($scope) {
      var htmlElement = ng.element(document.children[0]);
      htmlElement.addClass('spun');
    }
  });

});
