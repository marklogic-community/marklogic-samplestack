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

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

/**
 * Middleware to handle parsing bodies in requests which (may) have them.
 *
 * This module is just synactic/gramattical sugar on the `body-parser` module.
 * @module lib/parseBody
 * @type {Object}
 */
module.exports = function (app) {
  return {
    /**
     * Parse a JSON-serialized body.
     * @param {Object}   req
     * @param {Object}   res
     * @param {Function} next
     */
    json: jsonParser,
    /**
     * Parse a form/url-encoded body.
     * @param {Object}   req
     * @param {Object}   res
     * @param {Function} next
     */
    urlEncoded: urlencodedParser
  };
};
