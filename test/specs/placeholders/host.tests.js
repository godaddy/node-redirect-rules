var expect = require('chai').expect;
var test = require('../../util');

describe('The host placeholder', function() {
  var app;

  describe('for http1', function () {
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

  if (test.supportsHttp2) {
    describe('for http2', function () {
      before(function (done) {
        test.startHTTP2App(function (err, result) {
          app = result;
          done(err);
        });
      });

      it('uses the :authority header of the request', function (done) {
        var rule = { from: /.*/, to: '/{host}/{url}' };
        var opts = {
          url: test.baseUrl.replace('http:', 'https:') + 'rest/of/url'
        };
        app.verifyRules(rule, opts, function (err, headers) {
          expect(err).to.not.exist;
          expect(headers[':status']).to.equal(301);
          expect(headers.location).to.equal(`/127.0.0.1:${test.port}/rest/of/url`);
          done();
        });
      });

      after(function (done) {
        app.stop(done);
      });
    });
  }
});
