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
