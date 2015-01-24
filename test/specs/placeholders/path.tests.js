var expect = require('chai').expect;
var test = require('../../util');

describe('The path placeholder', function() {
  var app;

  before(function(done) {
    test.startHTTPApp(function(err, result) {
      app = result;
      done(err);
    });
  });

  it('outputs the URL without the query string', function(done) {
    var rule = { from: /.*/, to: 'http://newdomain.com/{path}' };
    var opts = { url: test.baseUrl + 'some/path?param=value' };
    app.verifyRules(rule, opts, function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(301);
      expect(res.headers.location).to.equal('http://newdomain.com/some/path');
      done();
    });
  });

  after(function(done) {
    app.stop(done);
  });
});
