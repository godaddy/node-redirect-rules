module.exports = {
  match: matchCondition,
  matchMap: matchConditionMap
};

function matchCondition(conditionName, conditionValue, value) {
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
  } else if (value === conditionValue) {
    result = {};
    result[conditionName] = value;
    return result;
  }
}

function matchConditionMap(conditionName, conditionValues, requestValues) {
  var expectedKeys = Object.keys(conditionValues);
  var result = {};
  var matched = expectedKeys.every(function(key) {
    var matchForProperty = matchCondition(
      conditionName + '.' + key,
      conditionValues[key],
      requestValues[key]);
    if (matchForProperty) {
      Object.keys(matchForProperty).forEach(function(key) {
        result[key] = matchForProperty[key];
      })
    }
    return !!matchForProperty;
  });
  return matched ? result : null;
}