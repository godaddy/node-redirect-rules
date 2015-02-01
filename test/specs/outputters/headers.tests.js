var expect = require('chai').expect;
var test = require('../../util');

describe('The headers outputter', function() {
  var app;

  before(function(done) {
    test.startHTTPApp(function(err, result) {
      app = result;
      done(err);
    });
  });

  it('outputs the location header for simple string destinations', function(done) {
    var rule = {
      from: '/url/1',
      to: '/url/2'
    };
    app.verifyRules(rule, test.baseUrl + 'url/1', function(err, res) {
      expect(err).to.not.exist;
      expect(res.headers.location).to.equal('/url/2');
      done();
    });
  });

  it('outputs the location header for a url destination rule', function(done) {
    var rule = {
      from: '/url/1',
      to: { url: '/url/2' }
    };
    app.verifyRules(rule, test.baseUrl + 'url/1', function(err, res) {
      expect(err).to.not.exist;
      expect(res.headers.location).to.equal('/url/2');
      done();
    });
  });

  it('outputs additional static headers', function(done) {
    var rule = {
      from: '/url/1',
      to: {
        url: '/url/2',
        headers: {
          'x-redirected-by': 'redirect-rules'
        }
      }
    };
    app.verifyRules(rule, test.baseUrl + 'url/1', function(err, res) {
      expect(res.headers['x-redirected-by']).to.equal('redirect-rules');
      done();
    });
  });

  it('outputs headers with variable substitutions', function(done) {
    var rule = {
      from: '/url/1',
      to: {
        url: '/url/2',
        headers: {
          'x-redirected-from': '{url}'
        }
      }
    };
    app.verifyRules(rule, test.baseUrl + 'url/1', function(err, res) {
      expect(res.headers['x-redirected-from']).to.equal('/url/1');
      done();
    });
  });

  after(function(done) {
    app.stop(done);
  });
});
