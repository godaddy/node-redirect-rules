var match = require('./util').match;
var parseAuthority = require('../utils/parse-authority');

module.exports = function(req, value) {
  var authority = parseAuthority(req.headers);
  return match('hostname', value, authority.hostname, true);
};
