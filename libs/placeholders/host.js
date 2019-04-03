module.exports = function(req) {
  return req.headers.host || req.headers[':authority'];
};
