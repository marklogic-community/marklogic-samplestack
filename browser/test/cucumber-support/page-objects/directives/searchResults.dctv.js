var SearchResult = require('./searchResult.dctv').SearchResult;

module.exports.support = function (obj) {
  /*******************************/
  /******** PUBLIC API ***********/
  /*******************************/


  Object.defineProperty(obj, 'resultsCount', {
    get: function () {
      return getSearchResultsCountElement()
        .getText()
        .then(function (text) {
          return parseInt(text.replace(/,/, ''));
        });
    }
  });

  obj.focusResultsItem = function (index) {
    return obj.qself(getResultsItems().then(
      function (items) {
        obj.focusedItem = new SearchResult(items[index], obj);
        return;
      }
    ));
  };

  obj.focusFirstResultsItem = function () {
    return obj.qself(getResultsItems().then(
      function (items) {
        obj.focusedItem = new SearchResult(items[0], obj);
        return;
      }
    ));
  };

  obj.focusLastResultsItem = function () {
    return obj.qself(getResultsItems().then(
      function (items) {
        obj.focusedItem = new SearchResult(items[items.length - 1], obj);
        return;
      }
    ));
  };

  /*******************************/
  /********** PRIVATE ************/
  /*******************************/

  var getResultsItems = function () {
    return element.all(by.className('ss-result'));
  };

  var getSearchResultsCountElement = function () {
    return element(by.className('ss-search-results-count'));
  };

};
