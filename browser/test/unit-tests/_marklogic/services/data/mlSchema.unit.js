define(['testHelper'], function (helper) {

  return function () {
    describe('mlSchema', function () {
      var sut;

      beforeEach(function (done) {
        angular.mock.module('_marklogic');
        inject(
          function (mlSchema) {
            sut = mlSchema;
            done();
          }
        );
      });

      it('should do basic validation', function () {
        var schema = {
          'id': '/thing',
          'type': 'object',
          'properties': {
            'name': {
              'type': 'string'
            },
            'votes': {
              'type': 'integer',
              'minimum': 1
            }
          }
        };
        var instance = {
          'name': 'Barack Obama',
          'address': {
            'lines': [ '1600 Pennsylvania Avenue Northwest' ],
            'zip': 'DC 20500',
            'city': 'Washington',
            'country': 'USA'
          },
          'votes': 'lots'
        };
        sut.addSchema(schema);
        var result = sut.validate(instance, '/thing');
        result.errors[0].property.should.equal('instance.votes');
      });

      it('should support multiple schema', function () {
        sut.addSchema({
          'id': '/thing#SimpleAddress',
          'type': 'object',
          'properties': {
            'lines': {
              'type': 'array',
              'items': {'type': 'string'},
              required: true
            },
            'zip': {'type': 'string'},
            'city': {'type': 'string'},
            'country': {'type': 'string', 'required': true}
          }
        });
        sut.addSchema({
          id: '/thing#SimplePerson',
          'type': 'object',
          'properties': {
            'name': {
              'type': 'string'
            },
            address: { $ref: '/thing#SimpleAddress', required: true },
            'votes': {
              'type': 'integer',
              'minimum': 1
            }
          }
        });
        var instance = {
          'name': 'Barack Obama',
          'address': {
            'zip': 'DC 20500',
            'city': 'Washington',
            'country': 'USA'
          },
          'votes': 1
        };
        var result = sut.validate(instance, '/thing#SimplePerson');
        result.errors[0].property.should.equal('instance.address.lines');
      });

    });
  };

});
