/* 
 * Copyright 2012-2015 MarkLogic Corporation 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */ 

var SearchResult = require('./searchResultConstructor.dctv').SearchResult;

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
