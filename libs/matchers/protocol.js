var match = require('./util').match;

module.exports = function(req, value) {
  return match('protocol', value, (req.connection && req.connection.encrypted) ? 'https' : 'http', true);
};
