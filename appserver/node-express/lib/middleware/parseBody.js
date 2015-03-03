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
