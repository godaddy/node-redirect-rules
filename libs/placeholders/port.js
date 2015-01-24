module.exports = function(req) {
  return req.socket.localPort;
};
