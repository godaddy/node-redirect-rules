var expect = require('chai').expect;
var test = require('../../util');

describe('The path matcher', function() {

  before(function(done) {
    test.startHTTPApp(function(err, result) {
      app = result;
      done(err);
    });
  });

  it('matches the URL without the query string', function(done) {
    var rule = { from: { path: '/some/url' }, to: '/other/url?{query}' };
    var opts = { url: test.baseUrl + 'some/url?with=param' };
    app.verifyRules(rule, opts, function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(301);
      expect(res.headers.location).to.equal('/other/url?with=param');
      done();
    });
  });

  after(function(done) {
    app.stop(done);
  });

});
