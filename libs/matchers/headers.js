var matchMap = require('./util').matchMap;

module.exports = function(req, expectedHeaderMatches) {
  return matchMap('headers', expectedHeaderMatches, req.headers);
};
