// var eventStream = require('event-stream');
var through2 = require('through2');
var _ = require('lodash');
var clone = require('gulp-clone');
var path = require('path');
var map = require('map-stream');

// var multimatch = require('multimatch');
// var gutil = require('gulp-util');
// var q = require('Q');
// var File = require('vinyl');

/**
 * These functions should be in individual plugins.  They are not specific
 * to MarkLogic.
 * @type {Object}
 */
var plugins = module.exports = {};


/**
 * TODO
 * Call a function on each file
 * @param  {[type]} opts [description]
 * @return {[type]}      [description]
 */
plugins.forEach = function(binding, func) {
  return through2.obj(function(file, enc, cb) {
    func.call(binding, file);
    this.push(file);
    cb();
  });
};

/**
 * TODO
 * @return {[type]} [description]
 */
plugins.drainAway = function() {
  return through2.obj(function(file, enc, cb) {
    // swallow the file
    cb();
  }, function(cb) {
    cb();
  });
};

plugins.branchClones = function(spec) {
  var firstTarget;
  var prevTarget;
  var targets = {};
  var newTarget;
  _.forEach(spec.targets, function(targetName) {
    targets[targetName] = newTarget = clone();

    if (!firstTarget) {
      firstTarget = newTarget;
    }
    else {
      prevTarget.pipe(newTarget);
    }

    prevTarget = newTarget;

  });

  spec.src.pipe(firstTarget);

  return targets;

};

plugins.rebase = function(outFolder, opt) {
  if (typeof outFolder !== 'string') {
    throw new Error('Invalid output folder');
  }
  var defaultMode;
  /* jshint ignore:start */
  defaultMode = 0777 & (~process.umask());
  /* jshint ignore:end */
  if (!opt) {
    opt = {};
  }
  if (!opt.cwd) {
    opt.cwd = process.cwd();
  }
  if (typeof opt.mode === 'string') {
    opt.mode = parseInt(opt.mode, 8);
  }

  var cwd = path.resolve(opt.cwd);
  var basePath = path.resolve(cwd, outFolder);
  var folderMode = (opt.mode || defaultMode);

  function rebaseFile(file, cb) {
    var writePath = path.resolve(basePath, file.relative);
    var writeFolder = path.dirname(writePath);

    if (typeof opt.mode !== 'undefined') {
      if (!file.stat) {
        file.stat = {};
      }
      file.stat.mode = opt.mode;
    }

    file.cwd = cwd;
    file.base = path.resolve(path.join(basePath, '..'));
    file.path = writePath;

    cb(null, file);
    // // mkdirp the folder the file is going in
    // // then write to it
    // mkdirp(writeFolder, folderMode, function(err){
    //   if (err) return cb(err);
    //   writeContents(writePath, file, cb);
    // });
  }
  var stream = map(rebaseFile);
  return stream;
};


// var handler = function(incoming, stream) {
//   return incoming.pipe(stream);
// };




// /**
//  * WARNING!!! NASTY SIDE EFFECT. DO NOT USE!!!
//  * This should remind you of Young Frankenstein
//  * @param  {[type]} opt [description]
//  * @return {[type]}        [description]
//  */
// plugins.rebase = function(opt) {
//   if (!opt) opt = {};
//   if (!opt.cwd) opt.cwd = process.cwd();
//   var cwd = path.resolve(opt.cwd);
//   var basePath = path.resolve(cwd, opt.base);

//   return through2.obj(function(file, enc, cb) {
//     console.log(JSON.stringify(file));
//     file = new File(_.merge(file, {base: 'src'}));
//     var writePath = path.resolve(basePath, file.relative);
//     file.cwd = cwd;
//     file.base = basePath;
//     file.path = writePath;
//     console.log(JSON.stringify(file));
//     this.push(file);
//     cb();
//   });
// };

// /**
//  * TODO
//  * @return {[type]} [description]
//  */
// plugins.drainAway = function() {
//   return through2.obj(function(file, enc, cb) {
//     // swallow the file
//     cb();
//   }, function(cb) {
//     cb();
//   });
// };

// plugins.streamToPromise = function(stream) {
//   var d = q.defer();
//   var chunks = [];
//   stream.on('data', function(chunk) {
//     chunks.push(chunk);
//   });
//   stream.on('error', function(err) {
//     d.reject(err);
//   });
//   stream.on('end', function() {
//     d.resolve(chunks);
//   });
//   return d.promise;
// };

// // plugins.drainToPromise = function(stream) {
// //   var deferred = q.defer();
// //   stream.on('data', function() {});
// //   stream.on('end', function() {
// //     deferred.resolve();
// //   });
// //   return deferred.promise;
// // };

// plugins.predo = function(func) {
//   var first = true;
//   var toDo = function() {
//     if (first) {
//       first = false;
//       func();
//     }
//   };
//   return through2.obj(function(file, enc, cb) {
//     toDo();
//     this.push(file);
//     cb();
//   }, function(cb) {
//     toDo();
//     cb();
//   });
// };

// plugins.postdo = function(func) {
//   return through2.obj(function(file, enc, cb) {
//     this.push(file);
//     cb();
//   }, function(cb) {
//     func();
//     cb();
//   });
// };

// plugins.prelog = function(name, message) {
//   var prefix = '[' + gutil.colors.blue(name) + '] ';
//   var log = _.bind(gutil.log, null, prefix + message);
//   return plugins.predo(log);
// };

// plugins.postlog = function(name, message) {
//   var prefix = '[' + gutil.colors.blue(name) + '] ';
//   var log = _.bind(gutil.log, null, prefix + message);
//   return plugins.postdo(log);
// };

// /**
//  * Create a set of divergent streams based on globs or functions.
//  *
//  * This belong in its own plugin (gulp-subsets).
//  * @param  {Object} params
//  * @return {stream.Passthrough}
//  */
// plugins.subsets = function(params) {
//   var multimatch = require('multimatch');

//   var subsets = params.subsets;

//   params = _.merge({
//     keepAll: true
//   }, params);

//   var streamsToMerge = [];

//   var nonMatches = through2.obj();
//   streamsToMerge.push(nonMatches);

//   _.forEach(subsets, function(subset) {

//     var through = through2.obj();
//     // call the subset function to set up the pipes, piping
//     // to combined to gather all of the subsets and reassemble what
//     // remains from their processing

//     // calling the subset's function allows us to set up
//     // writable -> [subsetPipe] -> something we can merge below.
//     //
//     // So we hang onto the result of the function in the pipesToMerge
//     // array.
//     var outStream = through.pipe(subset.streamFunc());
//     streamsToMerge.push(
//       outStream
//     );
//     // hang onto this so can send files to it -- it will be subset[2]
//     subset.writable = outStream;
//     // console.log(JSON.stringify(subset));


//   });

//   var merged = eventStream.merge.apply(null, streamsToMerge);

//   var reader = through2.obj(function(file, enc, cb) {
//     // console.log('receiving file ' + file.path);
//     var matches = false;
//     var hasMatched = false;
//     _.forEach(subsets, function(subset) {
//       // console.log(JSON.stringify(subset));
//       if (typeof subset.pattern === 'function') {
//         matches = subset.pattern(file);
//       }
//       else {
//         matches = multimatch(
//           file.relative, subset.pattern, subset.options
//         ).length > 0;
//       }
//       // matches = typeof subset.pattern === 'function' ?
//       //     subset.pattern(file) :
//       //     multimatch(
//       //       file.relative, subset.pattern, subset.options
//       //     ).length > 0;

//       if (matches) {
//         if (hasMatched) {
//           throw new Error('overlapping subsets');
//         }
//         else {
//           try {
//             subset.writable.write(file);

//           }
//           catch (err) {
//             console.log(file.path);
//             throw err;
//           }
//           hasMatched = true;
//           // console.log('has matched and written: ' + file.path);
//         }

//       }
//       else {
//         // console.log('non-match: ' + file.path);
//         if (params.keepAll) {
//           nonMatches.write(file);
//         }
//       }
//     });

//     cb();

//   }, function(cb) {
//     console.log('subsets got end');
//     // send end to everybody
//     // this should flow trhough and be handled by the merge
//     nonMatches.end();
//     _.forEach(subsets, function(subset) {
//       console.log('ending subset ' + subset.pattern.toString());
//       subset.writable.end();
//     });
//     cb();
//   });

//   return eventStream.duplex(reader, merged);
// };
