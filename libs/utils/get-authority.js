function getAuthority(headers) {
  return headers[':authority'] || headers.host;
}

module.exports = getAuthority;
