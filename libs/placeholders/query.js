var parseRequest = require('../parseRequest');

module.exports = function(req) {
  return parseRequest(req.query).search;
};
