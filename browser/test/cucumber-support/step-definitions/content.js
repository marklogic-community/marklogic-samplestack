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

  this.When(
    /view the content contributor/,
    function (next) {
      this.currentPage.focusedItem.metadata.openContributorDialog()
        .then(this.notifyOk(next), next);
    }
  );

  this.When(
    /content contributor reputation is known as "(.*)"/,
    function (repAlias, next) {
      var self = this;

      this.currentPage.focusedItem.metadata.reputation
        .then(function (rep) { self[repAlias] = rep; })
        .then(this.notifyOk(next), next);
    }
  );

  this.When(
    /I vote it up/,
    function (next) {
      this.currentPage.questionVoteUp().then(this.notifyOk(next), next);
    }
  );

  this.Then(
    /content contributor reputation is greater than "(.*)"/,
    function (repAlias, next) {
      var self = this;

      expect(this.currentPage.focusedItem.metadata.reputation)
        .to.eventually.be.greaterThan(self[repAlias])
        .then(this.notifyOk(next), next);
    }
  );

};
