var csrf = require('csurf');

module.exports = {
  set: function (req, res, next) {
    try {
      csrf()(req, res, function () {});
    }
    // expect failure, csurf needs work here, they don't let you
    // cleanly generate a token ATM
    catch (err) {}
    res.set('X-CSRF-Token', req.csrfToken());
    next();
  },

  errHandler: function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') {
      return next(err);
    }
    // handle CSRF token errors here
    res.status(403).send('session has expired or form tampered with');
  },

  conditionalCheck: function (req, res, next) {
    if (req.user) {
      csrf()(req, res, function (err) {
        if (err) {
          res.send(400, { error: 'CSRF Violation' });
        }
        else {
          next();
        }
      });
    }
    else {
      next();
    }
  }

};
