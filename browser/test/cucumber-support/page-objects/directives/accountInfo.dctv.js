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

module.exports.support = function (obj) {
  /*******************************/
  /******** PUBLIC API ***********/
  /*******************************/

  Object.defineProperty(obj, 'isLoggedIn', {
    get: function () {
      return obj.loggedInUserName.then(
        function (userName) {
          return !!userName;
        },
        function () { return false; }
      );
    }
  });

  Object.defineProperty(obj, 'loggedInUserName', {
    get: function () {
      return getAccountInfoLabel().then(
        function (label) {
          return label ? label.replace(/ \[.*$/, '') : null;
        }
      );
    }
  });

  Object.defineProperty(obj, 'loggedInUserReputation', {
    get: function () {
      return getAccountInfoLabel().then(
        function (label) {
          return label ? parseInt(label.match(/[^\[]*\[([^\]]*)\]/)) : null;
        }
      );
    }
  });

  obj.accountInfoOpen = function () {
    return obj.pself(getAccountInfoElement().then(
      function (el) {
        if (el) {
          return el.click();
        }
        else {
          throw new Error('cannot find accountInfoElement');
        }
      }
    ));
  };

  obj.logout = function () {
    return obj.pself(obj.accountInfoOpen()
      .then(function () {
        getLogoutButton().click();
      })
    );
  };


  /*******************************/
  /********** PRIVATE ************/
  /*******************************/

  var getAccountInfoElement = function () {
    var el = element(by.className(
      'ss-user-info-display-name-reputation'
    ));
    return el.isPresent()
    .then(function (isPresent) {
      if (isPresent) {
        return el.isDisplayed()
        .then(function (presentAndDisplayed) {
            // return it only if it's visible
            return presentAndDisplayed ? el : null;
          }
        );
      }
      else {
        return null;
      }
    });
  };

  var getAccountInfoLabel = function () {
    return getAccountInfoElement().then(
      function (el) {
        return el ? el.getText() : null;
      }
    );
  };

  var getLogoutButton = function () {
    return element(by.className('ss-logout'));
  };

};
