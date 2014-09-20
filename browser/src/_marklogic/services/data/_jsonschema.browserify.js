define([], function () {
  // use commonjs syntax to get the jsonschema module ;
  // browserify process will cause this to contain/return  the proper ojbect
  // for use in the browser
  var jsonschema = require('jsonschema');
  return jsonschema;

});
