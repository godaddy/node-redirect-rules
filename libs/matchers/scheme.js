var match = require('./util').match;

module.exports = function(req, value) {
  return match('scheme', value.toLowerCase(), (req.connection && req.connection.encrypted) ? 'https' : 'http');
};
