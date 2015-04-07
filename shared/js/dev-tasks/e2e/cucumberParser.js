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

module.exports = {
  handle: function (args, ptorConfig, ptorProc, cb) {
    ptorProc.on('close', function (code) {
      if (code) {
        cb(code);
      }
      else {
        cb();
      }
    });
    return;
  }
};

// var convert = require('cucumber-junit/lib/cucumber_junit');
// var findJson = function (line, accumulated) {
//   var isStartPattern = /\[(?:[^\d]*)(?:[\d]*)(?:[^#]*)#[\d]*\]\s\[/;
//   /* jshint ignore:start */
//   var isEndPattern = /\[(?:[^\d]*)(?:[\d]*)(?:[^#]*)#[\d]*\]\s\]SauceLabs\sresults\savailable\sat\s(?:[^\s]*)/;
//   /* jshint ignore:end */
//
//
//
// };

// var toFilePrep = function (folderName, reporter) {
//   var toFilePath;
//
//   if (folderName) {
//     toFilePath =  path.resolve(
//       ctx.paths.reportsDir,
//       'e2e/',
//       args.middleTier,
//       folderName
//     );
//     switch (reporter) {
//       case 'xunit':
//         toFilePath += '.xml';
//         break;
//       case 'json':
//         toFilePath += '.json';
//         break;
//       default:
//         toFilePath += '.log';
//         break;
//     }
//   }
//   else {
//     toFilePath = path.resolve(
//       ctx.paths.reportsDir, args.toFile
//     );
//   }

// courtesy https://gist.github.com/pguillory/729616
var util = require('util');

// var oldWrite;
// var hookStdOut = function (callback) {
//   oldWrite = process.stdout.write;
//
//   process.stdout.write = (function (write) {
//     return function (string, encoding, fd) {
//       write.apply(process.stdout, arguments);
//       callback(string, encoding, fd);
//     };
//   })(process.stdout.write);
//
//   return function () {
//     process.stdout.write = oldWrite;
//   };
// };
//

        //   if (args.reporter === 'xunit') {
        //     try {
        //       var converted = convert(
        //         fs.readFileSync(toFilePath, { encoding: 'utf8' })
        //       );
        //       fs.writeFileSync(toFilePath, converted);
        //     }
        //     catch (err) {
        //       $.util.log(
        //        chalk.red('could not parse JSON for ' + toFilePath)
        //       );
        //       try {
        //         fs.unlinkSync(toFilePath);
        //       } catch (err) {}
        //     }
        //   }

// [internet explorer 11 Windows 8.1 #6]         ]
// [internet explorer 11 Windows 8.1 #6]       }
// [internet explorer 11 Windows 8.1 #6]     ]
// [internet explorer 11 Windows 8.1 #6]   }
// [internet explorer 11 Windows 8.1 #6] ]SauceLabs results available at http://saucelabs.com/jobs/3d992a5dfc244be68596c9f032d83738
//
// [launcher] 3 instance(s) of WebDriver still running
// ..........
// ------------------------------------
// [chrome 33 Linux #7] PID: 37127
// [chrome 33 Linux #7] Using SauceLabs selenium server at http://localhost:4445/wd/hub
// [chrome 33 Linux #7] [
// [chrome 33 Linux #7]   {
// [chrome 33 Linux #7]     "id": "Landing-Page",
// [chrome 33 Linux #7]     "name": "Landing Page",
// [chrome 33 Linux #7]     "description": "\nhttps://github.com/marklogic/samplestack-angular/features/landing-page/landing-page.md",
// [chrome 33 Linux #7]     "line": 1,
// [chrome 33 Linux #7]     "keyword": "Feature",
// [chrome 33 Linux #7]     "uri": "/Users/ssalsbur/Documents/_ws/marklogic-samplestack/specs/features/test.feature",
// [chrome 33 Linux #7]     "elements": [
// [chrome 33 Linux #7]       {
// [chrome 33 Linux #7]         "name": "",
// [chrome 33 Linux #7]         "id": "Landing-Page;",
// [chrome 33 Linux #7]         "line": 5,
