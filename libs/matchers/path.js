var parseRequest = require('../parseRequest');
var match = require('./util').match;

module.exports = function(req, value) {
  return match('path', value, parseRequest(req).pathname);
};
