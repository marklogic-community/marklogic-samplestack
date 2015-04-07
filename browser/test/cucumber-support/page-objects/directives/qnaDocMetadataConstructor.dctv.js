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

module.exports.Metadata = function (webElement, page) {
  var self = this;

  self.openContributorDialog = function () {
    return page.qself(getAuthorElement().element(by.css('a')).click());
  };

  Object.defineProperty(self, 'reputation', {
    get: function () {
      return getReputationElement().getText().then(function (rep) {
        return parseInt(rep);
      });
    }
  });

  /*******************************/
  /********** PRIVATE ************/
  /*******************************/

  var getAuthorLink = function () {
    return getAuthorElement().element(by.css('a'));
  };

  var getAuthorElement = function () {
    return getElement().element(by.className('ss-author'));
  };

  var getReputationElement = function () {
    return getElement().element(by.className('ss-reputation'));
  };

  var getElement = function () {
    return webElement.all(by.css('ss-qna-doc-metadata')).first();
  };

};
