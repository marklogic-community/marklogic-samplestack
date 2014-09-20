define(['app/module'], function (module) {

  /**
   * @ngdoc domain
   * @name ssQnaDoc
   * @requires mlModelBase
   * @requires mlSchema
   *
   * @description
   * TBD
   */

  module.factory('ssQnaDoc', [

    '$q', 'mlModelBase', 'mlSchema', 'mlUtil',
    function (
      $q, mlModelBase, mlSchema, mlUtil
    ) {
      /**
       * @ngdoc type
       * @name SsQnaDocObject
       * @description The model instance prototype for
       * {@link ssQnaDoc}.
       */

      /**
       * @ngdoc method
       * @name SsQnaDocObject#constructor
       * @param {object} spec Data used to populate
       * the new instance.
       * @description Constructor. Uses default implementation.
       */
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

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.getResourceId
       * @description Overrides the resource id.
       * @returns {string} 'questions'
       */
      SsQnaDocObject.prototype.getResourceId = function () {
        return 'questions';
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.onResponseGET
       * @param {object} data Data from the server.
       * @description Override. Processes the data to standardize and
       * adapt the schema for the browser.
       *
       * <p style="color: red">
       * TODO This method will be revisited as the REST API
       * schema is standardized and as proper seed data becomes
       * available. It is likely that the method will not be required at
       * that time. It is primarily patching for holes in seed data and
       * inconsistencies in the domain schema which are being addressed.
       * </p>
       */
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

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.isLocalOwner
       * @param {object} obj A question, answer or comment object (i.e.
       * something that has an `owner` property.
       * @returns {boolean} `true` if the owner is "locally created",
       * `false` if the owner is from Stack Overflow.
       * if the data Data from the server.
       * @description Whether or not a content object is owned by a local or
       * StackOverflow user.
       *
       * <p style="color: red">
       * TODO this method uses an ugly hack and will be rewritten once
       * better data are availale from the server.
       * </p>
       */
      SsQnaDocObject.prototype.isLocalOwner = function (obj) {
        var n = obj.owner ?
            obj.owner.displayName :
            '';
        return n === 'joeUser' || n === 'maryAdmin';
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.soOwnerId
       * @param {object} obj A question, answer or comment object (i.e.
       * something that has an `owner` property.
       * @returns {String|null} If a local owner, null, otherwise the
       * StackOverflow
       * user id of the owner.
       * @description If a StackOverflow user owns the content object, the id
       * of that SO user.
       */
      SsQnaDocObject.prototype.soOwnerId = function (obj) {
        if (this.isLocalOwner(obj)) {
          return null;
        }
        else {
          return obj.owner ? obj.owner.id : null;
        }
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.soUserName
       * @param {object} obj A question, answer or comment object (i.e.
       * something that has an `owner` property.
       * @returns {String|null} If a local owner, null, otherwise the
       * StackOverflow
       * user's display name.
       * @description If a StackOverflow user owns the content object, the
       * display name
       * of that SO user.
       */
      SsQnaDocObject.prototype.soUserName = function (obj) {
        return this.soOwnerId(obj) ?
            obj.owner.displayName :
            null;
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.soUserLink
       * @param {object} obj A question, answer or comment object (i.e.
       * something that has an `owner` property.
       * @returns {String|null} If a local owner, null, otherwise a URL
       * to the StackOverflow user profile.
       * @description If a StackOverflow user owns the content object, the
       * a URL to the user profile.
       */
      SsQnaDocObject.prototype.soUserLink = function (obj) {
        return this.soOwnerId(obj) && obj.owner.id ?
          'http://stackoverflow.com/users/' + obj.owner.id :
          null;
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.noValidUser
       * @param {object} obj A question, answer or comment object (i.e.
       * @description
       * <p style="color: red">
       * TODO: this method can go away with better data.
       */
      SsQnaDocObject.prototype.noValidUser = function (obj) {
        var noneValid = !this.soOwnerId(obj) && !this.isLocalOwner(obj);
        return noneValid;
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.formatDate
       * @param {string} str A date string to parse and reformat.
       * @description Reformats a date for display.
       */
      SsQnaDocObject.prototype.formatDate = function (str) {
        if (str && str.length) {
          var date = mlUtil.moment(str);
          return date.format('MMM D, \'YY') +
              ' at ' + date.format('h:mm');

        }
      };

      return mlModelBase.extend('SsQnaDocObject', SsQnaDocObject);
    }
  ]);
});
