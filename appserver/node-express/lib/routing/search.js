var orderedRoles = [ 'contributors', 'default' ];

module.exports = function (app, mw) {
  app.post('/v1/search', [
    mw.csrf.checkHeader,
    // mw.auth.roles.getBestRole.bind(app, orderedRoles),
    mw.parseBody.json,
    // mw.db.setClientForBestRoles.bind(app, ['contributor']),
    mw.db.setClientForRole.bind(app, 'contributors')
    // mw.searchQnaDocs
  ]);
};
