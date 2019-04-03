var getAuthority = require('../utils/get-authority');

module.exports = function(req) {
  return getAuthority(req.headers);
};
