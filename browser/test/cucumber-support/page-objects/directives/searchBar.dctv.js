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
    return element(by.className('ss-search-submit'));
  };

};
