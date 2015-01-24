var expect = require('chai').expect;
var test = require('../../util');

describe('The method matcher', function() {
  var app;

  before(function(done) {
    test.startHTTPApp(function(err, result) {
      app = result;
      done(err);
    });
  });

  it('matches the method of a request', function(done) {
    var rule = { from: { method: 'head' }, to: 'http://superoptimized.headrequests.com/{url}' };
    var opts = { url: test.baseUrl + 'rest/of/url', method: 'HEAD' };
    app.verifyRules(rule, opts, function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(301);
      expect(res.headers.location).to.equal('http://superoptimized.headrequests.com/rest/of/url');
      done();
    });
  });

  after(function(done) {
    app.stop(done);
  });
});
