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
    /visit the "(.*)" page[,]?$/,
    function (name, next) {
      if (!this.pages[name]) {
        throw new Error('undefined page name, "' + name + '"');
      }
      this.go(this.pages[name]).then(this.notifyOk(next), next);
    }
  );

  this.Then(
    /the page title is "(.*)"/,
    function (title, next) {
      expect(this.currentPage.pageTitle)
        .to.eventually.equal(title)
        .and.notify(next);
    }
  );

};
