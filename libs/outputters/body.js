module.exports = outputBody;

var IS_HTML = /^<html/i;
var IS_XML = /^</;

function outputBody(res, value) {
  if (value === undefined || value === null) {
    return;
  }

  if (typeof(value) !== 'string') {
    outputContent(res, JSON.stringify(value), 'application/json');
  } else if (IS_HTML.test(value)) {
    outputContent(res, value, 'text/html');
  } else if (IS_XML.test(value)) {
    outputContent(res, value, 'application/xml');
  } else {
    outputContent(res, value, 'text/plain');
  }
}

function outputContent(res, content, type) {
  if (!res.getHeader('content-type')) {
    res.setHeader('content-type', type);
  }
  res.write(content);
}
