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
