module.exports = function (err, req, res, next) {
  console.error(err.stack);
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }
  res.status(400).send({error: 'Invalid CSRF token.'});
};
