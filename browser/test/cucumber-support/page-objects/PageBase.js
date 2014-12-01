var util = require('util');

function PageBase () {
  var self = this;

  self.getElementIfPresent = function (locator) {
    var el = element(locator);
    try {
      return el.then(
        function (element) {
          return element;
        },
        function (err) {
          return null;
        }
      );
    }
    catch (err) {
      return q(null);
    }
  };

  Object.defineProperty(self, 'pageTitle', {
    get: function () {
      return browser.getTitle();
    }
  });

  Object.defineProperty(self, 'loginElement', {
    get: function () {
      return element(by.css('.ss-login a'));
    }
  });

  self.loginStart = function () {
    return self.loginElement.click();
  };

  self.loginCancel = function () {
    return element(by.css('.ss-dialog-login .ss-button-cancel')).click();
  };

  Object.defineProperty(self, 'loginSubmitButton', {
    get: function () {
      return element(by.css('.ss-button-submit'));
    }
  });

  self.loginSubmit = function () {
    return self.loginSubmitButton.click();
  };

  Object.defineProperty(self, 'loginSubmitEnabled', {
    get: function () {
      return self.loginSubmitButton.isEnabled();
    }
  });

  Object.defineProperty(self, 'loginUserNameElement', {
    get: function () {
      return element(by.className('ss-input-username'));
    }
  });

  Object.defineProperty(self, 'loginPasswordElement', {
    get: function () {
      return element(by.className('ss-input-password'));
    }
  });

  self.loginEnterUserName = function (userName) {
    return self.loginUserNameElement
      .clear()
      .sendKeys(userName);
  };

  self.loginEnterPassword = function (password) {
    return self.loginPasswordElement
    .clear()
    .sendKeys(password);
  };

  Object.defineProperty(self, 'loginFailedMessage', {
    get: function () {
      return element(by.css('.ss-dialog-login .login-failed'));
    }
  });

  Object.defineProperty(self, 'loginIsDenied', {
    get: function () {
      var msg = self.loginFailedMessage;
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


  self.login = function (userName, password) {
    return self.loginStart()
    .then(self.loginEnterUserName.bind(self, userName))
    .then(self.loginEnterPassword.bind(self, password))
    .then(self.loginSubmit);
  };

  Object.defineProperty(self, 'accountInfoElement', {
    get: function () {
      return self.getElementIfPresent(
        by.className('ss-user-info-display-name-reputation')
      );
    }
  });

  Object.defineProperty(self, 'accountInfoLabel', {
    get: function () {
      return self.accountInfoElement.then(
        function (el) {
          return el ? el.getText() : null;
        }
      );
    }
  });

  Object.defineProperty(self, 'userReputation', {
    get: function () {
      return self.accountInfoLabel.then(
        function (label) {
          return label ? parseInt(label.match(/[^\[]*\[([^\]]*)\]/)) : null;
        }
      );
    }
  });

  Object.defineProperty(self, 'userName', {
    get: function () {
      return self.accountInfoLabel.then(
        function (label) {
          return label ? label.replace(/ \[.*$/, '') : null;
        }
      );
    }
  });

  Object.defineProperty(self, 'isLoggedIn', {
    get: function () {
      return self.userName.then(
        function (userName) {
          return !!userName;
        },
        function () { return false; }
      );
    }
  });


  self.accountDropdownOpen = function () {
    return self.accountInfoElement.then(
      function (element) {
        return element.click();
      },
      function () {
        throw new Error('cannot access accountInfoElement');
      }
    );
  };

  Object.defineProperty(self, 'logoutButton', {
    get: function () {
      return element(by.css('.ss-account-dropdown button'));
    }
  });

  self.logout = function () {
    return self.accountDropdownOpen().then(
      function () {
        return self.logoutButton.click();
      },
      function (err) {
        console.log('in logout, cannot open account dropdown: ' +
            err.toString()
        );
        throw err;
      }
    );
  };

  self.loginIfNecessary = function (userName, password) {
    return self.userName.then(
      function (name) {
        var before = name ? self.logout : null;
        return q.when(before, self.login.bind(self, userName, password));
      }
    );
  };

  self.logoutIfNecessary = function () {
    return self.isLoggedIn.then(
      function (isLoggedIn) {
        if (isLoggedIn) {
          return self.logout();
        }
        else {
          return;
        }
      }
    );
  };
}

PageBase.instantiate = function (Page) {
  util.inherits(Page, PageBase);
  return new Page();
};

module.exports = PageBase;
