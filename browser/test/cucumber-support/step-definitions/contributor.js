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

  this.Then(/the contributor display name is "(.*)"/, function (name, next) {
    expect(this.currentPage.contributorDisplayName)
      .to.eventually.equal(name)
      .and.notify(next);
  });

  this.Then(/the contributor votes cast are greater than "(.*)"/, function (votes, next) {
    expect(this.currentPage.contributorVotesCast)
      .to.eventually.be.greaterThan(votes)
      .and.notify(next);
  });

  this.Then(
    /the contributor reputation is greater than "(.*)"/,
    function (reputation, next) {
      expect(this.currentPage.contributorReputation)
        .to.eventually.be.greaterThan(reputation)
        .and.notify(next);
    }
  );

  this.Then(/dismiss the dialog/, function (next) {
    this.currentPage.dismiss().then(this.notifyOk(next), next);
  });

};
