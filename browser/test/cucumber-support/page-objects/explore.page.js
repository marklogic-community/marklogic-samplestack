function ExplorePage () {
  ExplorePage.super_.call(this);
  this.url = '/';

  require('./search-bar').support(this);

  Object.defineProperty(this, 'docsCount', {
    get: function () {
      return element(by.className('ss-search-results-count'))
        .getText()
        .then(function (text) {
          return parseInt(text.replace(/,/, ''));
        });
    }
  });

  Object.defineProperty(this, 'firstResultTitle', {
    get: function () {
      return element.all(by.css('.ss-result-title'))
        .first()
        .element(by.css('a'))
        .getText()
        .then(function (text) {
          return text;
        });
    }
  });

  Object.defineProperty(this, 'lastResultTitle', {
    get: function () {
      return element.all(by.css('.ss-result-title'))
        .last()
        .element(by.css('a'))
        .getText()
        .then(function (text) {
          return text;
        });
    }
  });

  this.addFilter = function (filterModel,value) {
    var f = element(by.model(filterModel));
    // date filtering
    if (value) {
      if (value.startDate)
        console.log('add date filter');

      if (value.endDate)
        console.log('add date filter');
    }
    // TODO: Add filter for tags
    return (f.getAttribute("selected") !== "selected") ?
                f.then(function() { return f.click(); }) : f.then();
  };

  this.removeFilter = function (filterModel,value) {
    var f = element(by.model(filterModel));
    // date filtering
    if (value) {
      if (value.startDate)
        console.log('remove date filter');

      if (value.endDate)
        console.log('remove date filter');
    }
    // TODO: Add filter for tags
    return (f.getAttribute("selected") === "selected") ?
                f.then(function() { return f.click(); }) : f.then();
  };

}

var me = ExplorePage;
me.pageName = 'explore';
me.aliases = ['search', 'default', 'landing'];
World.addPage(me);
