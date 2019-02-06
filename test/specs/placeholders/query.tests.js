var expect = require('chai').expect;
var test = require('../../util');

describe('The query placeholder', function() {
  var app;

  before(function(done) {
    test.startHTTPApp(function(err, result) {
      app = result;
      done(err);
    });
  });

  it('outputs the query string of a request, including the "?"', function(done) {
    var rule = { from: /.*/, to: '/error?{query}' };
    var opts = { url: 'http://localhost:51789/something/?foo=bar' };
    app.verifyRules(rule, opts, function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(301);
      expect(res.headers.location).to.equal('/error?foo=bar');
      done();
    });
  });

  it('handles empty query strings', function(done) {
    var rule = { from: /.*/, to: '/error{query}' };
    var opts = { url: 'http://localhost:51789/something/' };
    app.verifyRules(rule, opts, function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(301);
      expect(res.headers.location).to.equal('/error');
      done();
    });
  });

  after(function(done) {
    app.stop(done);
  });
});
