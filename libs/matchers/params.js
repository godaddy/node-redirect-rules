var matchMap = require('./util').matchMap;
var parseRequest = require('../parseRequest');

module.exports = function(req, expectedParams) {
  return matchMap('params', expectedParams, parseRequest(req).query);
};
