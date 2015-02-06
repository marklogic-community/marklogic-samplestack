var path = require('path');
var gulp = require('gulp');
var _ = require('lodash');

var helper = require('../helper');
var $ = helper.$;

/*
 * temporary patcher of seed data
 */
module.exports = [{
  name: 'seed-patch',
  deps: [],
  func:function () {
    var moment = require('moment');
    var hasAnswers = 0;
    var s = gulp.src(
      'questions/**.json',
      { cwd: path.resolve(__dirname, '../../database/seed-data')}
    );
    s = s.pipe($.tap(function (file) {
      var j = JSON.parse(file.contents.toString());
      j.id = j.id.replace(/\/\//g, '/');
      j.id = j.id.replace(/\.json\.json$/g, '.json');
      var newTags = [];
      for (var i = 0; i < j.tags.length; i++) {
        if (j.tags[i] instanceof Array) {
          newTags.push(j.tags[i][0]);
        }
        else {
          newTags.push(j.tags[i]);
        }
      }
      j.tags = newTags;
      j.id = j.id.replace(/\/questions/g, '');
      j.id = j.id.replace(/\.json$/, '');
      j.id = j.id.replace(/\//g, '');
      j.id = '/questions/' + j.id;
      if (j.acceptedAnswerId) {
        j.acceptedAnswerId = j.acceptedAnswerId.replace(/answers/, '');
        j.acceptedAnswerId = j.acceptedAnswerId.replace(/\//g, '');
        j.acceptedAnswerId = j.acceptedAnswerId.replace(/\.json$/g, '');
        j.acceptedAnswerId = '/answers/' + j.acceptedAnswerId;
      }
      _.forEach(j.answers, function (answer) {
        answer.id = answer.id.replace(/answers/, '');
        answer.id = answer.id.replace(/\//g, '');
        answer.id = answer.id.replace(/\.json$/g, '');
        answer.id = '/answers/' + answer.id;
        delete answer.creationYearMonth;
      });
      if (j.answers && j.answers.length) {
        console.log(++hasAnswers);
      }
      if (j.lastActivityDate) {
        j.lastActivityDate = moment(j.lastActivityDate).year(2014)
            .toISOString().replace(/Z.*$/, '');
      }
      if (j.creationDate) {
        j.creationDate = moment(j.creationDate).year(2014)
            .toISOString().replace(/Z.*$/, '');
      }
      if (j.owner && !j.lastActivityDate) {
        j.lastActivityDate = new Date().toISOString().replace(/Z.*$/, '');
      }
      if (j.lastActivityDate) {
        j.creationYearMonth = moment(j.lastActivityDate).format('YYYYMM');
      }
      else {
        delete j.creationYearMonth;
      }
      file.contents = new Buffer(JSON.stringify(j, null, '  '));
    }));

    return s.pipe(
      gulp.dest(
        'questions',
        { cwd: path.resolve(__dirname, '../../database/seed-data')}
      )
    );
  }
}];
