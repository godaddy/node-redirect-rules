module.exports = {
  match: matchAgainstConditionValue
};

function matchAgainstConditionValue(conditionName, conditionValue, value) {
  if (conditionValue instanceof RegExp) {
    var match = conditionValue.exec(value);
    if (match) {
      var result = { url: match[0] };
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
