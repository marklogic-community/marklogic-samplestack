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
    /visit the "qnadoc" page with id "(.*)"/,
    function (qid, next) {
      this.go(this.pages['qnadoc'], '/' + qid)
        .then(this.notifyOk(next), next);
    }
  );

  this.When(
    /visit the "qnadoc" page with id equal to "(.*)"/,
    function (qid, next) {
      var self = this;
      this.go(this.pages['qnadoc'], '/' + self[qid])
        .then(this.notifyOk(next), next);
    }
  );

  this.When(
    /focus on the question/,
    function (next) {
      this.currentPage.focusQuestion()
        .then(this.notifyOk(next), next);
    }
  );

};
