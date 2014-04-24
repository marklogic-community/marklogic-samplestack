define(function() {

  /**
   * Represents a ui-router state definition that includes all aspects
   * of a state definition
   * @constructor
   * @param {Object} definition ui-router-based definition for the state.
   * TODO: document the handling of templateUrls
   */
  var StateDef = function(parent, name, definition) {

    if (!definition) { definition = {}; }
    definition.name = name;


    this.children = [];

    if (parent) {
      definition.fullName = parent.fullName + '.' + name;
      parent.children.push(this);
    }
    else {
      definition.fullName = name;
    }

    if (_.isUndefined(definition.templateUrl)) {
      definition.templateUrl = '/js/states/' +
          definition.fullName.replace('.', '-') + '.html';
      //TODO: deal with multi-views
    }

    _.merge(this, definition);

  };
  StateDef.prototype.addChild = function(name, definition) {
    return new StateDef(this, name, definition);
  };

  // StateDef.prototype.newChild = function(name, definition) {

  //   var child = new StateDef(name, definition);
  //   return child;
  // };

  return StateDef;

});
