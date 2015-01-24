module.exports = parseRequest;

var url = require('url');

function parseRequest(req) {
  return req['$redirectorUrl'] || (req['$redirectorUrl'] = url.parse(req.url, true));
}
