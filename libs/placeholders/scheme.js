module.exports = function(req) {
  return req.connection && req.connection.encrypted ? 'https' : 'http';
};
