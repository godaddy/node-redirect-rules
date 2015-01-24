var expect = require('chai').expect;
var test = require('../../util');

describe('The scheme placeholder', function() {

  describe('for HTTP servers', function() {

    var app;

    before(function(done) {
      test.startHTTPApp(function(err, result) {
        app = result;
        done(err);
      });
    });

    it('is "http"', function(done) {

      app.verifyRules({ from: /.*/, to: '{scheme}://some.host.com{url}' }, test.baseUrl, function(err, res) {
        expect(err).to.not.exist;
        expect(res.statusCode).to.equal(301);
        expect(res.headers.location).to.equal('http://some.host.com/');
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

    it('is "https"', function(done) {

      var rule = { from: /.*/, to: '{scheme}://some.host.com{url}' };
      app.verifyRules(rule, test.baseUrl.replace('http', 'https'), function(err, res) {
        expect(err).to.not.exist;
        expect(res.statusCode).to.equal(301);
        expect(res.headers.location).to.equal('https://some.host.com/');
        done();
      });

    });

    after(function(done) {
      app.stop(done);
    });

  });
});
