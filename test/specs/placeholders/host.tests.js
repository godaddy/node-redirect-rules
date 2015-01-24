var expect = require('chai').expect;
var test = require('../../util');

describe('The host placeholder', function() {
  var app;

  before(function(done) {
    test.startHTTPApp(function(err, result) {
      app = result;
      done(err);
    });
  });

  it('uses the host header of the request', function(done) {
    var rule = { from: /.*/, to: '/{host}/{url}' };
    var opts = { url: test.baseUrl + 'rest/of/url', headers: { host: "fakedomain.com" } };
    app.verifyRules(rule, opts, function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(301);
      expect(res.headers.location).to.equal('/fakedomain.com/rest/of/url');
      done();
    });
  });

  after(function(done) {
    app.stop(done);
  });
});
