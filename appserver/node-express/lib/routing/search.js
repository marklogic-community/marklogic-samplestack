var orderedRoles = [ 'contributors', 'default' ];

module.exports = function (app, mw) {
  app.post('/v1/search', [
    mw.csrf.checkHeader,
    mw.auth.roles.getBestRole.bind(app, orderedRoles),
    mw.parseBody.json,
    mw.db.getClientForBestRole.bind(app, orderedRoles),
    // mw.searchQnaDocs
  ]);
};
