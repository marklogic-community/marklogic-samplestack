var csrf = require('csurf');
var options = libRequire('../options');
/**
 * Middleware to handle anti-CSRF protection on requests.
 *
 * We generate, track and return a token when a user gets a session, and after
 * that, we check that future requests on that session "know" the CSRF token.
 *
 * May be enabled/disable in {@link options}.
 *
 * @module lib/csrf
 * @type {Object}
 */
var mw = module.exports = {
  /**
   * Error handlers associated with this module.
   * @type {Array}
   */
  errHandlers: [
    function (err, req, res, next) {
      if (err.code !== 'EBADCSRFTOKEN') {
        return next(err);
      }
      res.status(400).send({error: 'Invalid CSRF token.'});
    }
  ],

  /**
   * If enabled, generates a CSRF token, stores it to the session (TODO), and
   * sets the response HEADER.
   *
   * @param {Object}   req
   * @param {Object}   res
   * @param {Function} next
   */
  setHeader: function (req, res, next) {
    if (options.enableCsrf) {
      try {
        csrf()(req, res, function () {});
      }
      // expect failure, csurf needs work here, they don't let you
      // cleanly generate a token ATM
      catch (err) {}
      res.set('X-CSRF-Token', req.csrfToken());
    }
    next();
  },

  /**
   * When this is called, we only do something if BOTH:
   * a) CSRF protection is enabled in the options file; and
   * b) the request is associated with a session
   *
   * In other words, we allow people to proceed without CSRF if they
   * do not even claim to have a session, or if we aren't intending to
   * enforce CSRF. Otherwise, they must pass the CSRF token test.
   * (The token must have been stored in the session data for this to work.)
   * TODO:
   * a) revive session data if the user comes in with a sessionid
   * b) set the server-side token in memory to match the revived session data
   * c) store token in session data as part of auth. mechanism
   * d) throw out sessions when a bad request comes in (not found token or
   * CSRF mismatch)
   *
   * @param {Object}   req
   * @param {Object}   res
   * @param {Function} next
   */
  checkHeader: function (req, res, next) {
    if (options.enableCsrf && req.session) {
      csrf()(req, res, next);
    }
    else {
      next();
    }
  }
};
