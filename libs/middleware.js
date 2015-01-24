module.exports = createMiddlewareForRules;

var matchers = require('./matchers');
var placeholders = require('./placeholders');

function createMiddlewareForRules(rules) {
  return function(req, res, next) {
    var match = findMatch(rules, req);
    if (match) {
      res.statusCode = match.status || 301;
      res.setHeader('location', match.targetURL);
      res.end();
    } else {
      next();
    }
  };
}

function findMatch(rules, req) {
  if (!(rules instanceof Array)) {
    rules = [rules];
  }

  for (var i = 0; i < rules.length; i++) {
    var match = tryMatch(rules[i], req);
    if (match) {
      return match;
    }
  }
}

function tryMatch(rule, req) {
  var conditions = rule.from;
  if (typeof(conditions) !== 'object' || conditions instanceof RegExp) {
    conditions = { url: conditions };
  }

  var props = Object.keys(conditions);
  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    if (prop in matchers) {
      var match = matchers[prop](req, conditions[prop]);
      if (match) {
        return {
          status: rule.status,
          targetURL: generateTargetURL(rule.to, req, match)
        };
      }
    }
  }
}

function generateTargetURL(pattern, req, match) {
  return pattern.replace(/\{([^}]*?)}/g, function(substr, placeholder) {
    if (placeholder in match) {
      return match[placeholder];
    }

    var parts = placeholder.split('.');
    placeholder = parts[0];
    var param = parts[1];
    if (placeholder in placeholders) {
      var result = placeholders[placeholder](req);
      return param ? result[param] : result;
    }

    return substr;
  });
}
