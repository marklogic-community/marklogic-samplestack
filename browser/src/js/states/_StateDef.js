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
      definition.fullName = parent.fullName + '.' + name;
      parent.children.push(this);
    }
    else {
      definition.fullName = name;
    }

    if (_.isUndefined(definition.templateUrl)) {
      definition.templateUrl = '/js/states/' +
          // replace dots with dashes (dashes used in fnames
          // so that they sort logically)
          definition.fullName.replace(/\./g, '-')
              // remove 'root-' so we don't repeat in fnames
              .replace(/root-/, '')
              // replace root with _root b/c filename has _ prepended so
              // it sorts to top
              .replace(/root/, '_root') + '.html';
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
