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

module.exports = function () {
  this.World = World;

  this.Then(
    /docs count is "(.*)"/,
    function (count, next) {
      expect(this.currentPage.resultsCount)
          .to.eventually.equal(parseInt(count)).and.notify(next);
    }
  );

  this.Then(
    /docs count is greater than "(.*)"/,
    function (count, next) {
      expect(this.currentPage.resultsCount)
          .to.eventually.be.greaterThan(parseInt(count)).and.notify(next);
    }
  );

  this.Then(
    /docs count is less than "(.*)"/,
    function (count, next) {
      expect(this.currentPage.resultsCount)
      .to.eventually.be.lessThan(parseInt(count)).and.notify(next);
    }
  );

  this.When(
    /focus on the "(.*)" search result/,
    function (positional, next) {
      switch (positional) {
        case 'first':
          this.currentPage.focusFirstResultsItem()
            .then(this.notifyOk(next), next);
          break;
        case 'last':
          this.currentPage.focusLastResultsItem()
            .then(this.notifyOk(next), next);
          break;
        default:
          next('Invalid positional for search result: ' + positional);
      }
    }
  );

  this.When(
    /focus on search result item "(.*)"/,
    function (positional, next) {
      this.currentPage.focusResultsItem(parseInt(positional))
        .then(this.notifyOk(next), next);
    }
  );

  this.Then(
    /the result "(.*)" is "(.*)"/,
    function (name, value, next) {
      expect(this.currentPage.focusedItem[name])
          .to.eventually.equal(value).and.notify(next);
    }
  );

};
