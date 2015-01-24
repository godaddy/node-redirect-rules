module.exports = createMiddlewareForRules;

var _ = require('lodash');
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

  var allMatches = {};
  var allConditionsMatch = Object
    .keys(conditions)
    .every(function(prop) {
      var matcher = matchers[prop];
      if (!matcher)
        return false;

      var match = matcher(req, conditions[prop]);
      if (!match)
        return false;

      _.assign(allMatches, match);
      return true;
    });

  if (allConditionsMatch) {
    return {
      status: rule.status,
      targetURL: generateTargetURL(rule.to, req, allMatches)
    };
  }
}

var SCHEMALESS_PREFIX = /^\/\//;
var DOUBLE_SLASHES_AFTER_BEGINNING = /([^\/])\/{2,}/g;
var DOUBLE_SLASHES_NOT_FOLLOWING_COLON = /([^:\/]|^)\/{2,}/g;
var PLACEHOLDERS = /\{([^}]*?)}/g;
var DOUBLE_QUESTION_MARKS = /\?{2,}/g;

function generateTargetURL(pattern, req, match) {
  var unwantedDoubleSlashes = SCHEMALESS_PREFIX.test(pattern)
    ? DOUBLE_SLASHES_AFTER_BEGINNING
    : DOUBLE_SLASHES_NOT_FOLLOWING_COLON;
  return pattern
    // Substitute placeholders
    .replace(PLACEHOLDERS, function(substr, placeholder) {
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

      return '';
    })
    // Clean up double slashes, which could result from empty placeholders in the URL
    .replace(unwantedDoubleSlashes, '$1/')
    // Clean up double question marks, which could result from doing '?{query}'
    .replace(DOUBLE_QUESTION_MARKS, '?');
}
