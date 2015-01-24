var expect = require('chai').expect;
var test = require('../../util');

describe('The port matcher', function() {

  describe('for HTTP servers', function() {

    var app;

    before(function(done) {
      test.startHTTPApp(function(err, result) {
        app = result;
        done(err);
      });
    });

    it('matches when the request was received on the specified port', function(done) {
      var rule = { from: { port: test.port }, to: 'http://otherdomain.com/{url}' };
      var opts = { url: test.baseUrl + 'rest/of/url' };
      app.verifyRules(rule, opts, function(err, res) {
        expect(err).to.not.exist;
        expect(res.statusCode).to.equal(301);
        expect(res.headers.location).to.equal('http://otherdomain.com/rest/of/url');
        done();
      });
    });

    it('matches an implicit port 80', function(done) {
      var rule = { from: { port: 80 }, to: 'http://otherdomain.com/{url}' };
      var opts = { url: test.baseUrl + 'rest/of/url', headers: { host: 'localhost' } }; // Pretend this was a port 80
      app.verifyRules(rule, opts, function(err, res) {
        expect(err).to.not.exist;
        expect(res.statusCode).to.equal(301);
        expect(res.headers.location).to.equal('http://otherdomain.com/rest/of/url');
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

    it('matches an implicit port 443', function(done) {
      var rule = { from: { port: 443 }, to: 'http://otherdomain.com/{url}' };
      var opts = {
        url: (test.baseUrl + 'rest/of/url').replace('http', 'https'),
        headers: { host: 'localhost' } // Pretend this was a port 443
      };
      app.verifyRules(rule, opts, function(err, res) {
        expect(err).to.not.exist;
        expect(res.statusCode).to.equal(301);
        expect(res.headers.location).to.equal('http://otherdomain.com/rest/of/url');
        done();
      });
    });

    after(function(done) {
      app.stop(done);
    });

  });
});
