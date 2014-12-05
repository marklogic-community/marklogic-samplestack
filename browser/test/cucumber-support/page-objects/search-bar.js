/*
 * Search Bar related lookups and operations added to Page Base
 * so they can be accessed by the QnA page tests as well
 */

module.exports.support = function (obj) {
  Object.defineProperty(obj, 'queryText', {
    get: function () {
      return element(by.model('searchbarText')).getText();
    }
  });

  Object.defineProperty(obj, 'searchbarTextElement', {
    get: function () {
      return element(by.model('searchbarText'));
    }
  });

  Object.defineProperty(obj, 'searchbarSumbmitElement', {
    get: function () {
      return element(by.css('.ss-search-bar-tools button'));
    }
  });

  obj.enterSearchText = function (text) {
    return obj.qself(obj.searchbarTextElement
      .clear()
      .sendKeys(text)
    );
  };

  obj.searchSubmit = function () {
    return obj.qself(obj.searchbarSumbmitElement.click());
  };

  obj.search = function (text) {
    return obj.enterSearchText(text)
      .then(obj.searchSubmit);
  };

};
