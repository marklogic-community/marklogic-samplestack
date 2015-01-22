define([
  'mocks/index'
], function (mocks) {

  return function () {
    describe('ssTagsSearch', function () {
      var $httpBackend;
      var ssTagsSearch;
      var mlUtil;

      beforeEach(function (done) {
        angular.mock.module('app');
        inject(
          function (_$httpBackend_, _ssTagsSearch_, _mlUtil_) {
            $httpBackend = _$httpBackend_;
            ssTagsSearch = _ssTagsSearch_;
            mlUtil = _mlUtil_;
            done();
          }
        );
      });

      it('should validate a minimally viable search', function () {
        var self = this;
        var s = ssTagsSearch.create({});
        expect(s.$ml.valid).to.be.true;
      });

      it('should post a minimal body for minimal search', function () {
        var s = ssTagsSearch.create();
        $httpBackend.expectPOST('/v1/tags', {
          search: {
            start: s.criteria.tagsQuery.start,
            pageLength: s.criteria.tagsQuery.pageLength,
            qtext: [''],
            timezone: window.jstz.determine().name()
          }
        }).respond(mocks.tagsResult);
        s.post();
        $httpBackend.flush();
      });


      it('should post a body for underlying search', function () {
        var s = ssTagsSearch.create({
          criteria: { constraints: { dateStart: {
            value: mlUtil.moment('2014-08-01T00:00:00.000-05:00')
          } } }
        });
        $httpBackend.expectPOST('/v1/tags', {
          search: {
            start: s.criteria.tagsQuery.start,
            pageLength: s.criteria.tagsQuery.pageLength,
            qtext: [''],
            query: {
              'and-query': {
                queries: [ {
                  'range-constraint-query': {
                    'constraint-name': 'lastActivity',
                    'value': mlUtil.moment('2014-08-01T00:00:00.000-05:00'),
                    'range-operator': 'GE'
                  }
                } ]
              }
            },
            timezone: window.jstz.determine().name()
          }
        }).respond(mocks.tagsResult);
        s.post();
        $httpBackend.flush();
      });

    });
  };
});
