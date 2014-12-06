module.exports.support = function (obj) {
  /*******************************/
  /******** PUBLIC API ***********/
  /*******************************/

  obj.loginStart = function () {
    return obj.qself(getLoginElement().click());
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
    return element(by.css('.ss-dialog-login .login-failed'));
  };

  var getLoginElement = function () {
    return element(by.css('.ss-login a'));
  };

  var getLoginSubmitButton = function () {
    return element(by.css('.ss-button-submit'));
  };

  var getLoginUserNameElement = function () {
    return element(by.className('ss-input-username'));
  };

  var getLoginPasswordElement = function () {
    return element(by.className('ss-input-password'));
  };

};
