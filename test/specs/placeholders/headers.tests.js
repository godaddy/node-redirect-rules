var expect = require('chai').expect;
var test = require('../../util');

describe('The headers placeholder', function() {
  var app;

  before(function(done) {
    test.startHTTPApp(function(err, result) {
      app = result;
      done(err);
    });
  });

  it('can output the value of an HTTP request header', function(done) {
    var rule = { from: /.*/, to: '/{headers.x-app-name}{url}' };
    var opts = { url: test.baseUrl + 'rest/of/url', headers: { "x-app-name": "foo" } };
    app.verifyRules(rule, opts, function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(301);
      expect(res.headers.location).to.equal('/foo/rest/of/url');
      done();
    });
  });

  after(function(done) {
    app.stop(done);
  });
});
