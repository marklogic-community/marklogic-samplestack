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

  obj.loginStart = function () {
    return obj.qself(
      getLoginElement()
      .then(function (el) {
        return el.click();
      })
    );
  };

  obj.loginCancel = function () {
    return obj.qself(
      element(by.css('.ss-dialog-login .ss-button-cancel')).click()
    );
  };

  obj.loginSubmit = function () {
    return obj.qself(getLoginSubmitButton().click());
  };

  Object.defineProperty(obj, 'loginSubmitEnabled', {
    get: function () {
      return getLoginSubmitButton().isEnabled();
    }
  });

  obj.loginEnterUserName = function (userName) {
    return obj.qself(
      getLoginUserNameElement()
      .clear()
      .sendKeys(userName)
    );
  };

  obj.loginEnterPassword = function (password) {
    return obj.qself(getLoginPasswordElement()
      .clear()
      .sendKeys(password)
    );
  };

  obj.login = function (userName, password) {
    return q.invoke(obj, 'loginStart')
      .invoke('loginEnterUserName', userName)
      .invoke('loginEnterPassword', password)
      .invoke('loginSubmit');
  };

  Object.defineProperty(obj, 'loginIsDenied', {
    get: function () {
      var msg = getLoginFailedMessage();
      return msg.isDisplayed().then(
        function (isVisible) {
          return isVisible && msg.getText().then(
            function (text) {
              return text.indexOf('Unauthorized') >= 0;
            }
          );
        }
      );
    }
  });

  /*******************************/
  /******** PRIVATE ***********/
  /*******************************/

  var getLoginFailedMessage = function () {
    return element(by.className('ss-login-failed'));
  };

  var getLoginElement = function () {
    return element(by.className('ss-login-dialog-open'));
  };

  var getLoginSubmitButton = function () {
    return element(by.className('ss-login-submit'));
  };

  var getLoginUserNameElement = function () {
    return element(by.className('ss-input-username'));
  };

  var getLoginPasswordElement = function () {
    return element(by.className('ss-input-password'));
  };

};
