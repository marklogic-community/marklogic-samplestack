var roles = [ 'contributors', 'default' ];

module.exports = function (app, mw) {
  app.post('/v1/tags', [
    mw.auth.tryReviveSession,
    mw.auth.associateBestRole.bind(app, roles),
    mw.parseBody.json,

    function (req, res, next) {
      // Handle typeahead and ask tags
      if (req.body.search.forTag) {
        return req.db.tags.getTags(req.body)
        .then(function (result) {
          return res.status(200).send(result);
        })
        .catch(next);
      }
      // Handle related tags
      else if (req.body.search.relatedTo) {
        return req.db.tags.getRelatedTags(req.body)
        .then(function (result) {
          // TODO make it work
          return res.status(200).send(result);
        })
        .catch(next);
      }
    }

  ]);
};
