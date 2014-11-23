function ExplorePage () {
  ExplorePage.super_.call(this);
  this.url = '/';

  Object.defineProperty(this, 'queryText', {
    get: function () {
      return q(element(by.model('searchbarText'))
      .getText());
    }
  });

  Object.defineProperty(this, 'docsCount', {
    get: function () {
      return element(by.className('ss-search-results-count'))
        .getText()
        .then(function (text) {
          return parseInt(text.replace(/,/, ''));
        });
    }
  });


}

var self = ExplorePage;

self.name = 'explore';
self.aliases = ['search', 'default', 'landing'];
World.addPage(self);
