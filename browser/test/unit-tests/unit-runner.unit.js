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

require.config({

  paths: {
    'angular-mocks': 'deps/angular-mocks/angular-mocks',
    'testHelper': 'testHelper.unit'
  }

});

require(['application'], function (app) {

  require(['angular-mocks'], function () {

    app.config(['$provide', function ($provide) {
      $provide.decorator('$browser', ['$delegate', function ($delegate) {
        $delegate.$$baseHref = '/';
        $delegate.baseHref = function () {
          return this.$$baseHref;
        };
        return $delegate;
      }]);
    }]);


    require(['testHelper', 'index.unit'], function (helper) {

      // window.sinon = sinon;
      var myMocha = window.mochaPhantomJS ?
          window.mochaPhantomJS :
          window.mocha;

      myMocha.run();

    });

  });
});
