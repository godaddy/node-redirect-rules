var expect = require('chai').expect;
var test = require('../../util');

describe('The headers matcher', function() {
  var app;

  before(function(done) {
    test.startHTTPApp(function(err, result) {
      app = result;
      done(err);
    });
  });

  it('matches when all specified headers match', function(done) {
    var rule = { from: { headers: { 'user-agent': /Windows NT 5.*Trident/ } }, to: 'https://otherdomain.com/{url}' };
    var opts = {
      url: test.baseUrl + 'rest/of/url',
      headers: { "user-agent": "Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; .NET CLR 1.1.4322; .NET CLR 2.0.50727)" }
    };
    app.verifyRules(rule, opts, function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(301);
      expect(res.headers.location).to.equal('https://otherdomain.com/rest/of/url');
      done();
    });
  });

  it('does not match when a specified header does not match', function(done) {
    var rule = { from: { headers: { 'user-agent': /Windows NT 5.*Trident/ } }, to: 'https://otherdomain.com/{url}' };
    var opts = {
      url: test.baseUrl + 'rest/of/url',
      headers: { "user-agent": "Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko" }
    };
    app.verifyRules(rule, opts, function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(204);
      done();
    });
  });

  after(function(done) {
    app.stop(done);
  });
});
