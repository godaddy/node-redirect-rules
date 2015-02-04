module.exports = createMiddlewareForRules;

var _ = require('lodash');
var requireDir = require('require-directory');
var matchers = require('./matchers');
var placeholders = require('./placeholders');
var outputters = requireDir(module, './outputters');
var outputTypes = [ 'status', 'headers', 'body' ]; // Place in sequential order

function createMiddlewareForRules(rules) {
  return function(req, res, next) {
    var destination = findDestination(rules, req);
    if (destination) {
      outputTypes
        .filter(function(key) { return key in destination; })
        .forEach(function(key) {
          outputters[key](res, destination[key]);
        });
      res.end();
    } else {
      next();
    }
  };
}

function findDestination(rules, req) {
  if (!(rules instanceof Array)) {
    rules = [rules];
  }

  for (var i = 0; i < rules.length; i++) {
    var destination = attemptRule(rules[i], req);
    if (destination) {
      return destination;
    }
  }
}

function attemptRule(rule, req) {
  var conditions = rule.from;
  if (typeof(conditions) !== 'object' || conditions instanceof RegExp) {
    conditions = { url: conditions };
  }

  var allMatchVars = {};
  var allConditionsMatch = Object
    .keys(conditions)
    .every(function(prop) {
      var matcher = matchers[prop];
      if (!matcher)
        return false;

      var matchVars = matcher(req, conditions[prop]);
      if (!matchVars)
        return false;

      _.assign(allMatchVars, matchVars);
      return true;
    });

  if (allConditionsMatch) {
    return generateDestination(rule, req, allMatchVars);
  }
}

function generateDestination(rule, req, variables) {
  var result = {
    status: rule.to.status || rule.status || 301,
    headers: rule.to.headers || {},
    body: rule.to.body
  };

  if (typeof(rule.to) !== 'object') {
    result.headers.location = rule.to;
  } else {
    result.headers.location = rule.to.url;
  }

  variables.redirectURL = generateDestinationUrl(result.headers.location, req, variables);
  result.headers.location = '{redirectURL}';

  return substitutePlaceholders(result, variables, req);
}

var SCHEMALESS_PREFIX = /^\/\//;
var DOUBLE_SLASHES_AFTER_BEGINNING = /([^\/])\/{2,}/g;
var DOUBLE_SLASHES_NOT_FOLLOWING_COLON = /([^:\/]|^)\/{2,}/g;
var DOUBLE_QUESTION_MARKS = /\?{2,}/g;

function generateDestinationUrl(pattern, req, variables) {
  var unwantedDoubleSlashes = SCHEMALESS_PREFIX.test(pattern)
    ? DOUBLE_SLASHES_AFTER_BEGINNING
    : DOUBLE_SLASHES_NOT_FOLLOWING_COLON;
  return substitutePlaceholders(pattern, variables, req)
    // Clean up double slashes, which could result from empty placeholders in the URL
    .replace(unwantedDoubleSlashes, '$1/')
    // Clean up double question marks, which could result from doing '?{query}'
    .replace(DOUBLE_QUESTION_MARKS, '?');
}

var PLACEHOLDERS = /\{([^}]*?)}/g;

function substitutePlaceholders(value, variables, req) {
  var type = typeof(value);
  if (type === 'object') {
    return Object
      .keys(value)
      .reduce(function(result, prop) {
        result[prop] = substitutePlaceholders(value[prop], variables, req);
        return result;
      }, {});
  }

  if (type !== 'string')
    return value;

  return value.replace(PLACEHOLDERS, function(substr, placeholder) {
    if (placeholder in variables) {
      return variables[placeholder];
    }

    var parts = placeholder.split('.');
    placeholder = parts[0];
    var param = parts[1];
    if (placeholder in placeholders) {
      var result = placeholders[placeholder](req);
      return param ? result[param] : result;
    }

    return '';
  });
}
