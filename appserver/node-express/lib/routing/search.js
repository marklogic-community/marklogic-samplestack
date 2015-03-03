var roles = [ 'contributors', 'default' ];

module.exports = function (app, mw) {
  app.post('/v1/search', [
    mw.auth.tryReviveSession,
    mw.auth.associateBestRole.bind(app, roles),
    mw.parseBody.json,

    // db.searchQnaDocs
  ]);
};
