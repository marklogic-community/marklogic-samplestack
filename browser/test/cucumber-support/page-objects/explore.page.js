var utilities = require('../utilities');

function ExplorePage () {
  var self = this;
  ExplorePage.super_.call(self);
  self.url = '/';

  require('./directives/searchBar.dctv').support(self);
  require('./directives/searchResults.dctv').support(self);
  require('./dialogs/contributor.dlg').support(self);

  self.filters = {
    clearAll: function () {
      return self.qself(q.all([
        self.filters.mineOnly.setValue(false),
        self.filters.resolvedOnly.setValue(false)
      ]));
    },
    mineOnly: {
      setValue: function (value) {
        return self.qself(
          utilities.setCheckboxValue(getMineOnlyFilterElement(), value)
        );
      }
    },
    resolvedOnly: {
      setValue: function (value) {
        return self.qself(
          utilities.setCheckboxValue(getResolvedOnlyFilterElement(), value)
        );
      }
    }
  };


  /*******************************/
  /********** PRIVATE ************/
  /*******************************/

  var getMineOnlyFilterElement = function () {
    return element(by.model('showMineOnly'));
  };

  var getResolvedOnlyFilterElement = function () {
    return element(by.model('resolvedOnly'));
  };

}

var me = ExplorePage;
me.pageName = 'explore';
me.aliases = ['search', 'default', 'landing'];
World.addPage(me);
