describe('services/rest', function () {
  describe('docs', function () {
    var $httpBackend;
    var baseUrl = '<%= restUrl %>';
    var sut;

    beforeEach(function (done) {
      module('app');
      inject(
        function ($injector) {
          sut = $injector.get('rest');
          $httpBackend = $injector.get('$httpBackend');
          done();
        }
      );
    });

    it('should get docs from the server', function () {
      $httpBackend.expectGET(baseUrl + '/foo').respond([
        '/foo/1', '/foo/2'
      ]);
      $httpBackend.expectGET(baseUrl + '/foo/1').respond(
        {id: 1, name: 'a'}
      );
      $httpBackend.expectGET(baseUrl + '/foo/2').respond(
        {id: 2, name: 'b'}
      );
      var docs = sut.docs.get();
      $httpBackend.flush();
      docs.should.eventually.eql([
        { id: 1, title: 'a'}, { id: 2, title: 'b' }
      ]);
    });

    it('should get a docs from the server', function () {
      $httpBackend.expectGET(baseUrl + '/foo/1').respond(
        {point: 'b'}
      );

      var resp = sut.docs.get('1');

      resp.should.eventually.have.property('body', 'b');
      resp.should.eventually.have.property('id', '1');
      $httpBackend.flush();
    });

    it('should put a doc to the server', function () {
      $httpBackend.expectPUT(baseUrl + '/foo/1', {id: 1, name: 'a'})
        .respond(204);
      sut.docs.put({id: 1, title: 'a'})
          .should.eventually.have.property('status', 204);
      $httpBackend.flush();
    });

    it('should delete a doc from the server', function () {
      $httpBackend.expectDELETE(baseUrl + '/foo/1')
        .respond(204);
      sut.docs.delete(1)
          .should.eventually.have.property('status', 204);
      $httpBackend.flush();
    });

    it('should do something really weird to pretend it\'s posting a doc' +
        ' to the server',
      function () {
        $httpBackend.expectGET(baseUrl + '/foo/new').respond({ id: '1234'});
        $httpBackend.expectPUT(baseUrl + '/foo/1234').respond(204);
        var doc = { a: 'b'};
        sut.docs.post(doc)
            .should.eventually.equal('1234');
        $httpBackend.flush();
      }
    );

  });


});
