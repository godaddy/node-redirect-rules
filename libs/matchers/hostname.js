var match = require('./util').match;

module.exports = function(req, value) {
  var host = req.headers.host || req.headers[':authority'];
  return match('hostname', value, host.split(':')[0], true);
};
