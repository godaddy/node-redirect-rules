var match = require('./util').match;
var parseAuthority = require('../utils/parse-authority');

module.exports = function(req, value) {
  var authority = parseAuthority(req.headers);
  var port = authority.port;
  if (!port) {
    port = (req.connection && req.connection.encrypted) ? 443 : 80;
  }
  return match('port', value, port);
};
