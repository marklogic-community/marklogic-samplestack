require.config({

  paths: {
    'angular-mocks': 'deps/angular-mocks/angular-mocks',
    'testHelper': 'testHelper.unit'
  }

});

require(['application'], function () {
  require(['angular-mocks'], function () {

    require(['testHelper', 'index.unit'], function (helper) {

      // window.sinon = sinon;
      var myMocha = window.mochaPhantomJS ?
          window.mochaPhantomJS :
          window.mocha;

      myMocha.run();

    });

  });
});
