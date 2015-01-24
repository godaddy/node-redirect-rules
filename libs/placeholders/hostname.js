var hostOf = require('./host');

module.exports = function(req) {
  return hostOf(req).split(':')[0];
};
