define(['app/module'], function (module) {

  /**
   * @ngdoc service
   * @name ssQnaDoc
   * @requires mlModelBase
   * @requires mlSchema
   *
   * @description
   */

  module.factory('ssQnaDoc', [

    '$q', 'mlModelBase', 'mlSchema', 'mlUtil',
    function (
      $q, mlModelBase, mlSchema, mlUtil
    ) {
      var SsQnaDocObject = function (spec) {
        mlModelBase.object.call(this, spec);
      };
      SsQnaDocObject.prototype = Object.create(
        mlModelBase.object.prototype
      );
      SsQnaDocObject.prototype.$mlSpec = {
        schema: mlSchema.addSchema({
          id: 'http://marklogic.com/samplestack#qnaDoc',
          required: ['id'],
          properties: {
            id: { type: 'string', minLength: 36, maxLength: 36 },
          }
        })
      };
      SsQnaDocObject.prototype.getResourceId = function () {
        return 'questions';
      };

      SsQnaDocObject.prototype.onResponseGET = function (data) {
        var self = this;

        mlModelBase.object.prototype.onResponseGET.call(this, data);
        var docScore = this.itemTally || 0;
        var acceptedAnswerIndex;
        angular.forEach(this.answers, function (answer, index) {
          if (answer.id === self.acceptedAnswerId) {
            acceptedAnswerIndex = index;
          }
          docScore += answer.itemTally || 0;
          angular.forEach(answer.comments, function (comment) {
            comment.owner = comment.commenter;
            delete comment.commenter;
          });
        });

        this.docScore = docScore;

        if (acceptedAnswerIndex >= 0) {
          var acceptedAnswer = this.answers.splice(
            acceptedAnswerIndex,
            1
          )[0];
          this.answers.unshift(acceptedAnswer);
        }
      };

      SsQnaDocObject.prototype.isLocalOwner = function (obj) {
        var n = obj.owner ?
            obj.owner.displayName :
            '';
        return n === 'joeUser' || n === 'maryAdmin';
      };

      SsQnaDocObject.prototype.soOwnerId = function (obj) {
        if (this.isLocalOwner(obj)) {
          return null;
        }
        else {
          return obj.owner ? obj.owner.id : null;
        }
      };

      SsQnaDocObject.prototype.soUserName = function (obj) {
        return this.soOwnerId(obj) ?
            obj.owner.displayName :
            null;
      };

      SsQnaDocObject.prototype.soUserLink = function (obj) {
        return this.soOwnerId(obj) && obj.owner.id ?
          'http://stackoverflow.com/users/' + obj.owner.id :
          null;
      };

      SsQnaDocObject.prototype.noValidUser = function (obj) {
        var noneValid = !this.soOwnerId(obj) && !this.isLocalOwner(obj);
        return noneValid;
      };

      SsQnaDocObject.prototype.formatDate = function (str) {
        if (str && str.length) {
          var date = mlUtil.moment(str);
          return date.format('MMM D, \'YY') +
              ' at ' + date.format('h:mm');

        }
      };

      // SsQnaDocObject.prototype.voteQuestion = function (
      //   contributor, upDown
      // ) {
      //   var deferred = $q.defer();
      //
      //   if ()
      //
      //
      // };
      //
      return mlModelBase.extend('SsQnaDocObject', SsQnaDocObject);
    }
  ]);
});
