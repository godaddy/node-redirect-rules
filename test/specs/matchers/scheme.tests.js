var expect = require('chai').expect;
var test = require('../../util');

describe('The scheme matcher', function() {

  describe('for HTTP servers', function() {

    var app;

    before(function(done) {
      test.startHTTPApp(function(err, result) {
        app = result;
        done(err);
      });
    });

    it('matches "http"', function(done) {
      var rule = { from: { scheme: 'http' }, to: 'https://otherdomain.com/{url}' };
      var opts = { url: test.baseUrl + 'rest/of/url' };
      app.verifyRules(rule, opts, function(err, res) {
        expect(err).to.not.exist;
        expect(res.statusCode).to.equal(301);
        expect(res.headers.location).to.equal('https://otherdomain.com/rest/of/url');
        done();
      });
    });

    after(function(done) {
      app.stop(done);
    });

  });

  describe('for HTTPS servers', function() {

    var app;

    before(function(done) {
      test.startHTTPSApp(function(err, result) {
        app = result;
        done(err);
      });
    });

    it('matches "https"', function(done) {
      var rule = { from: { scheme: 'https' }, to: '//secure.otherdomain.com/{url}' };
      var opts = { url: test.secureBaseUrl + 'rest/of/url' };
      app.verifyRules(rule, opts, function(err, res) {
        expect(err).to.not.exist;
        expect(res.statusCode).to.equal(301);
        expect(res.headers.location).to.equal('//secure.otherdomain.com/rest/of/url');
        done();
      });
    });

    after(function(done) {
      app.stop(done);
    });

  });
});
