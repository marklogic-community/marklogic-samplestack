var fs = require('fs');
var globby = require('globby');
var minimatch = require('minimatch');
var _ = require('lodash');
var copyright = 'Copyright 2012-' +
        (new Date().getFullYear()) + ' MarkLogic Corporation';
var copyrightLength = copyright.length;

var defaultCopyrightText;
/* jshint ignore:start */

defaultCopyrightText = '/* \n\
 * Copyright 2012-2015 MarkLogic Corporation \n\
 * \n\
 * Licensed under the Apache License, Version 2.0 (the "License"); \n\
 * you may not use this file except in compliance with the License. \n\
 * You may obtain a copy of the License at \n\
 * \n\
 *    http://www.apache.org/licenses/LICENSE-2.0 \n\
 * \n\
 * Unless required by applicable law or agreed to in writing, software \n\
 * distributed under the License is distributed on an "AS IS" BASIS, \n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. \n\
 * See the License for the specific language governing permissions and \n\
 * limitations under the License. \n\
 */ \n\
\n\
';

/* jshint ignore:end */


/**
  Update copyright in the following folders and files
  Don't include anything within a /bower_components dir

  FOLDERS
  /browser/src/
  /browser/test/
  /database/
  /shared/
  /appserver/node-express/
  /browser/options.js

  FILE TYPES
  *.html, *.js, *.sjs, & *.scss
 */

var copyrightText = {
  html: defaultCopyrightText
      .replace('/*','<!--')
      .replace('*/','-->'),
  js: defaultCopyrightText,
  sjs: defaultCopyrightText,
  scss: defaultCopyrightText
};

var globOptions = {};
var pattern = [
      'browser/options.js',
      'browser/{src,test}/**',
      'database/**',
      'appserver/node-express/**',
      'shared/**',
      '!**/bower_components/**'
    ];

module.exports = [{
  name: 'copyright',
  deps: [],
  func: function (cb) {
    // options is optional
    globby(pattern, globOptions, function (err, files) {
      if (err) {
        return cb(err);
      }
      _.forEach(files,function (filename) {
        var extension;
        if (minimatch(filename, '**/*.+(html|js|sjs|scss)')) {
          extension = _.last(filename.split('.'));
          console.log('Looking up "' + filename + '" information');
          var fileContents = fs.readFileSync('./' + filename, 'utf8');
          var operation;
          var regx = /Copyright (\d{4})-(\d{4}) MarkLogic Corporation/g;
          var match = regx.exec(fileContents);
          if (match) {
            operation = 'Updated';
            // update existing copyright text
            fileContents = fileContents
              .replace(regx, copyright);
          }
          else {
            operation = 'Added';
            // add complete copyright text
            fileContents = copyrightText[extension] + fileContents;
          }
          fs.writeFileSync('./' + filename, fileContents);
          console.log(operation + ' copyright to: ' + filename);
        }
      });
    });
    cb();
  }
}];
