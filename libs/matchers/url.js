module.exports = function(req, value) {
  if (value instanceof RegExp) {
    var match = value.exec(req.url);
    if (match) {
      var result = { url: match[0] };
      for (var i = 0; i < match.length; i++) {
        result['url.$' + i] = match[i];
      }
      return match;
    }
  } else {
    return req.url === value && { url: req.url };
  }
};
