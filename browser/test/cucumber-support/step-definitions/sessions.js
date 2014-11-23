module.exports = function () {
  this.World = World;

  this.Given(/I am a contributor/, function (next) {
    this.authenticateAs('joeUser@marklogic.com', 'joesPassword').then(next);
  });

  this.Given(/I am a visitor/, function (next) {
    this.authenticateAs().then(next);
  });

  this.When(/start to log in/, function (next) {
    this.currentPage.loginStart().then(next);
  });

  this.When(/attempt to log in with invalid/, function (next) {
    var cp = this.currentPage;
    var funcs = [
      cp.loginEnterUserName.bind(cp, 'notJoeUser'),
      cp.loginEnterPassword.bind(cp, 'not-his-password'),
      cp.loginSubmit.bind(cp)
    ];

    funcs.reduce(q.when, q()).then(next);
  });

  this.When(/login attempt is denied/, function (next) {
    expect(this.currentPage.loginIsDenied).to.eventually.equal(true)
    .and.notify(next);
  });

  this.When(
    /log in with insufficient password length/,
    function (next) {
      var cp = this.currentPage;
      var funcs = [
        cp.loginEnterUserName.bind(cp, 'joeUser@marklogic.com'),
        cp.loginEnterPassword.bind(cp, '000')
      ];
      funcs.reduce(q.when, q()).then(next);
    }
  );

  this.When(/not allowed to submit my credentials/, function (next) {
    expect(this.currentPage.loginSubmitEnabled)
        .to.eventually.equal(false).and.notify(next);
  });

  this.When(
    /log in as a Contributor/,
    function (next) {
      var cp = this.currentPage;
      var funcs = [
        cp.loginEnterUserName.bind(cp, 'joeUser@marklogic.com'),
        cp.loginEnterPassword.bind(cp, 'joesPassword'),
        cp.loginSubmit.bind(cp)
      ];

      funcs.reduce(q.when, q()).then(next);
    }
  );

  this.When(
    /I am logged in/,
    function (next) {
      expect(this.currentPage.isLoggedIn).to.eventually.equal(true)
      .and.notify(next);
    }
  );

};
