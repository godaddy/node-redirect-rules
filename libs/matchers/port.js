var match = require('./util').match;

module.exports = function(req, value) {
  var port = parseInt(req.headers.host.split(':')[1], 10);
  if (!port) {
    port = (req.connection && req.connection.encrypted) ? 443 : 80;
  }
  return match('port', value, port);
};
