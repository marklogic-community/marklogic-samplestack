define(['app'], function(app) {

  var me = {};
  me.add = function(dialog) {
    dialog.templateUrl = '/js/dialogs/' + dialog.name + '.html';
    dialog.controllerName = dialog.name + 'Controller';
    app.controller(dialog.controllerName, dialog.definition.controller);
  };

  return me;
});
