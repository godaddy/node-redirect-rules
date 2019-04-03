var expect = require('chai').expect;
var test = require('../../util');

describe('The hostname matcher', function() {
  var app;

  describe('with an http1 server', function () {
    before(function(done) {
      test.startHTTPApp(function(err, result) {
        app = result;
        done(err);
      });
    });

    it('matches the hostname of a request', function(done) {
      var rule = { from: { hostname: 'foo.com' }, to: 'http://otherdomain.com/{url}' };
      var opts = { url: test.baseUrl + 'rest/of/url', headers: { "host": "foo.com" } };
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

  if (test.supportsHttp2) {
    describe('with an http2 server', function () {
      before(function(done) {
        test.startHTTP2App(function(err, result) {
          app = result;
          done(err);
        });
      });

      it('matches the hostname of a request', function(done) {
        var rule = {
          from: { hostname: 'foo.com' },
          to: 'http://otherdomain.com/{url}'
        };
        var opts = {
          url: test.baseUrl
            .replace('http:', 'https:')
            .replace('127.0.0.1', 'foo.com') + 'rest/of/url'
        };
        app.verifyRules(rule, opts, function(err, headers) {
          expect(err).to.not.exist;
          expect(headers[':status']).to.equal(301);
          expect(headers.location).to.equal('http://otherdomain.com/rest/of/url');
          done();
        });
      });

      after(function(done) {
        app.stop(done);
      });
    });
  }
});
