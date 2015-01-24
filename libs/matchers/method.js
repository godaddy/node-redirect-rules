var match = require('./util').match;

module.exports = function(req, value) {
  return match('method', value.toLowerCase(), req.method.toLowerCase());
};
