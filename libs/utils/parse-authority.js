var getAuthority = require('./get-authority');

function parseAuthority(headers) {
  // In HTTP1, we have the `host` header. In HTTP2, the `:authority"
  // pseudo-header. Handle either, with HTTP2 taking priority
  var authority = getAuthority(headers);
  var parts = authority.split(':');
  return { hostname: parts[0], port: parseInt(parts[1], 10) };
}

module.exports = parseAuthority;
