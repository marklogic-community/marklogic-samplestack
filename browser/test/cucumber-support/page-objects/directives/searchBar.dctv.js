/*
 * Search Bar related lookups and operations added to Page Base
 * so they can be accessed by the QnA page tests as well
 */

module.exports.support = function (obj) {
  /*******************************/
  /******** PUBLIC API ***********/
  /*******************************/
  Object.defineProperty(obj, 'queryText', {
    get: function () {
      return getSearchbarTextElement().getText();
    }
  });

  obj.enterSearchText = function (text) {
    return obj.qself(getSearchbarTextElement()
      .clear()
      .sendKeys(text)
    );
  };

  obj.clearSearchText = function () {
    return obj.qself(getSearchbarTextElement()
      .clear()
      .then(obj.searchSubmit)
    );
  };

  obj.searchSubmit = function () {
    return obj.qself(getSearchbarSumbmitElement().click());
  };

  obj.search = function (text) {
    return obj.qself(obj.enterSearchText(text)
      .then(obj.searchSubmit)
    );
  };

  /*******************************/
  /******** PRIVATE ***********/
  /*******************************/

  var getSearchbarTextElement = function () {
    return element(by.model('searchbarText'));
  };

  var getSearchbarSumbmitElement = function () {
    return element(by.css('.ss-search-submit'));
  };

};
