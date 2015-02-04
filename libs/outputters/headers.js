module.exports = function(res, value) {
  Object
    .keys(value)
    .forEach(function(key) {
      res.setHeader(key, value[key]);
    });
};
