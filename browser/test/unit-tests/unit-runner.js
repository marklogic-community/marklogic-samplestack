require.config({

  paths: {
    'angular-mocks': 'deps/angular-mocks/angular-mocks'
  }

});

require(['appGo'], function () {
  require(['angular-mocks'], function () {

    require(['index.unit'], function () {

      // window.sinon = sinon;
      var myMocha = window.mochaPhantomJS ?
          window.mochaPhantomJS :
          window.mocha;

      // mocha.setup('bdd');
      myMocha.run();

    });

  });
});
