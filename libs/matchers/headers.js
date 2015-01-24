var match = require('./util').match;

module.exports = function(req, expectedHeaderMatches) {
  var expectedHeaders = Object.keys(expectedHeaderMatches);
  var result = {};
  var matched = expectedHeaders.every(function(header) {
    var matchForHeader = match('headers.' + header, expectedHeaderMatches[header], req.headers[header]);
    if (matchForHeader) {
      Object.keys(matchForHeader).forEach(function(key) {
        result[key] = matchForHeader[key];
      })
    }
    return !!matchForHeader;
  });
  return matched ? result : null;
};
