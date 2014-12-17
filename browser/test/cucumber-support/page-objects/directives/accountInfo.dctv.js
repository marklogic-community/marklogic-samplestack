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
    return obj.qself(getAccountInfoElement().then(
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
    return obj.qself(obj.accountInfoOpen()
      .then(function () {
        getLogoutButton().click();
      })
    );
  };


  /*******************************/
  /********** PRIVATE ************/
  /*******************************/

  var getAccountInfoElement = function () {
    var theEl;
    return element(by.className(
      'ss-user-info-display-name-reputation'
    )).then(
      // the element is there, maybe or not visisble
      function (el) {
        theEl = el;
        return el.isDisplayed();
      },
      // the element isn't present at all
      function () { return null; }
    ).then(
      function (presentAndDisplayed) {
        // return it only if it's visible
        return presentAndDisplayed ? theEl : null;
      }
    );
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
