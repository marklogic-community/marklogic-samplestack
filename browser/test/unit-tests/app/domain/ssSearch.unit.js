define([
  'testHelper',
  'mocks/index'
], function (helper, mocks) {

  return function () {
    describe('ssSearch', function () {
      var $httpBackend;
      var ssSearch;
      var mlUtil;

      beforeEach(function (done) {
        angular.mock.module('app');
        inject(
          function (_$httpBackend_, _ssSearch_, _mlUtil_) {
            $httpBackend = _$httpBackend_;
            ssSearch = _ssSearch_;
            mlUtil = _mlUtil_;
            done();
          }
        );
      });

      it('should be produce a valid range query', function () {
        var self = this;
        var s = ssSearch.create({
          criteria: { constraints: { dateStart: {
            value: mlUtil.moment('2014-08-01')
          } } }
        });
        $httpBackend.expectPOST(
          '/v1/search',
          {
            query: {
              qtext: '',
              'and-query': {
                queries: [ {
                  'range-constraint-query': {
                    'constraint-name': 'lastActivity',
                    'value': '2014-08-01T00:00:00',
                    'range-operator': 'GE'
                  }
                } ]
              }
            }
          }
        ).respond(500);
        // keep it from trying to parse the reponse by sending an error,
        // we only care that the request was valid
        s.post();
        $httpBackend.flush();
        assert(true);
      });

      it('should be produce a query for "resolved"', function () {
        var self = this;
        var s = ssSearch.create({
          criteria: { constraints: { resolved: {
            value: true
          } } }
        });
        $httpBackend.expectPOST(
          '/v1/search',
          {
            query: {
              qtext: '',
              'and-query': {
                queries: [ {
                  'value-constraint-query': {
                    'constraint-name': 'resolved',
                    'boolean': true
                  }
                } ]
              }
            }
          }
        ).respond(500);
        // keep it from trying to parse the reponse by sending an error,
        // we only care that the request was valid
        s.post();
        $httpBackend.flush();
        assert(true);
      });
    });

  };

});
