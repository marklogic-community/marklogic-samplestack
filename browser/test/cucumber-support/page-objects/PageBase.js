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

var util = require('util');

function PageBase () {
  var self = this;

  var qself = self.qself = function (value) {
    return q(value).thenResolve(self);
  };

  require('./directives/accountInfo.dctv').support(self);
  require('./dialogs/login.dlg').support(self);

  Object.defineProperty(self, 'pageTitle', {
    get: function () {
      return browser.getTitle();
    }
  });

  self.loginIfNecessary = function (userName, password) {
    return qself(self.loggedInUserName.then(
      function (name) {
        if (name === userName) {
          return;
        }
        else {
          var before = [];
          if (name) {
            before.push(self.logout());
          }
          return q.all(before)
            .then(function () {
              return self.login(userName, password);
            });
        }
      }
    ));
  };


  self.logoutIfNecessary = function () {
    return qself(self.isLoggedIn.then(
      function (isLoggedIn) {
        if (isLoggedIn) {
          return self.logout();
        }
        else {
          return self;
        }
      }
    ));
  };

}

PageBase.instantiate = function (Page) {
  util.inherits(Page, PageBase);
  return new Page();
};

module.exports = PageBase;
