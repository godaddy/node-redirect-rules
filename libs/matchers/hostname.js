var match = require('./util').match;

module.exports = function(req, value) {
  return match('hostname', value, (req.headers.host || '').split(':')[0]);
};
