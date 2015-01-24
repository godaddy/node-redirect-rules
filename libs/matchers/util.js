module.exports = {
  match: matchCondition,
  matchMap: matchConditionMap
};

var _ = require('lodash');

var REGEX_STRING = /^regex:\/(.*)\/([gim]*)$/;

function matchCondition(conditionName, conditionValue, value) {
  if (typeof(conditionValue) === 'string') {
    var regexStringMatch = REGEX_STRING.exec(conditionValue);
    conditionValue = regexStringMatch
      ? new RegExp(regexStringMatch[1], regexStringMatch[2])
      : conditionValue.toLowerCase();
  }

  if (conditionValue instanceof RegExp) {
    var match = conditionValue.exec(value);
    if (match) {
      var result = { };
      result[conditionName] = match[0];
      for (var i = 0; i < match.length; i++) {
        result[conditionName + '$' + i] = match[i];
      }
      return result;
    }
  } else {
    if (typeof(value) === 'string') {
      value = value.toLowerCase();
    }
    if (value == conditionValue) { // Intentional non-strict equality
      result = {};
      result[conditionName] = value;
      return result;
    }
  }
}

function matchConditionMap(conditionName, conditionValues, requestValues, caseInsensitive) {
  var expectedKeys = Object.keys(conditionValues);
  var result = {};
  var matched = expectedKeys.every(function(key) {
    var matchForProperty = matchCondition(
      conditionName + '.' + key,
      conditionValues[key],
      requestValues[key],
      caseInsensitive);
    if (matchForProperty) {
      _.assign(result, matchForProperty);
    }
    return !!matchForProperty;
  });
  return matched ? result : null;
}
