define(function() {

  /**
   * Represents a ui-router state definition that includes all aspects
   * of a state definition
   * TODO: document the handling of templateUrls
   * @constructor
   * @param {[type]} parent     [description]
   * @param {[type]} name       [description]
   * @param {[type]} definition [description]
   */
  var StateDef = function(parent, name, definition) {
    if (!definition) { definition = {}; }
    definition.name = name;


    this.children = [];

    if (parent) {
      var prefix = _.isUndefined(parent.childNamePrefix) ?
          parent.name :
          parent.childNamePrefix;

      definition.name = prefix + (prefix && '-')  + name;
      parent.children.push(this);
    }
    else {
      definition.name = name;
    }

    if (_.isUndefined(definition.templateUrl)) {
      // unless otherise specified, the templateUrl is in direct
      // relationship to the state name
      definition.templateUrl = '/js/states/' + definition.name + '.html';
    }

    _.merge(this, definition);

  };
  StateDef.prototype.addChild = function(name, definition) {
    return new StateDef(this, name, definition);
  };

  return StateDef;

});
