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

var users = require('../configuration/users');

module.exports = function () {
  this.World = World;
  var self = this;

  this.Given(/I am a contributor/, function (next) {
    this.authenticate()
      .then(this.notifyOk(next), next);
  });

  this.Given(/I am a visitor/, function (next) {
    this.authenticateAs()
      .then(this.notifyOk(next), next);
  });

  this.Given(/I am "(.*)"/, function (userName, next) {
    this.authenticateAs(users[userName].userName, users[userName].password)
      .then(this.notifyOk(next), next);
  });

  this.When(/start to log in/, function (next) {
    this.currentPage.loginStart()
      .then(this.notifyOk(next), next);
  });

  this.When(/attempt to log in with invalid/, function (next) {
    return q.invoke(this.currentPage, 'loginEnterUserName', 'notJoeUser@example.com')
      .invoke('loginEnterPassword', ['not-his-password'])
      .invoke('loginSubmit')
      .then(this.notifyOk(next), next);
  });

  this.When(/login attempt is denied/, function (next) {
    expect(this.currentPage.loginIsDenied).to.eventually.equal(true)
      .and.notify(next);
  });

  this.When(
    /log in with insufficient password length/,
    function (next) {
      return q.invoke(
        this.currentPage, 'loginEnterUserName', 'joe@example.com'
      )
        .invoke('loginEnterPassword', ['000'])
        .then(this.notifyOk(next), next);
    }
  );

  this.When(/not allowed to submit my credentials/, function (next) {
    expect(this.currentPage.loginSubmitEnabled)
        .to.eventually.equal(false).and.notify(next);
  });

  this.When(
    /log in as a Contributor/,
    function (next) {
      return q.invoke(
        this.currentPage, 'loginEnterUserName', 'joe@example.com'
      )
        .invoke('loginEnterPassword', ['joesPassword'])
        .invoke('loginSubmit')
        .then(this.notifyOk(next), next);
    }
  );

  this.When(
    /I am logged in/,
    function (next) {
      expect(this.currentPage.isLoggedIn).to.eventually.equal(true)
        .and.notify(next);
    }
  );

  this.Then(/my user name is "(.*)"/, function (userName, next) {
    expect(this.currentPage.loggedInUserName)
      .to.eventually.equal(userName)
      .and.notify(next);
  });

};
