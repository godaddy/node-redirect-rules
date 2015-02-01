var expect = require('chai').expect;
var test = require('../../util');

describe('The body outputter', function() {
  var app;

  before(function(done) {
    test.startHTTPApp(function(err, result) {
      app = result;
      done(err);
    });
  });

  it('outputs no body by default', function(done) {
    var rule = {
      from: '/url/1',
      to: '/url/2'
    };
    app.verifyRules(rule, test.baseUrl + 'url/1', function(err, res) {
      expect(err).to.not.exist;
      expect(res.body).to.equal('');
      done();
    });
  });

  it('can output text/plain content', function(done) {
    var rule = {
      from: '/url/1',
      to: {
        url: '/url/2',
        body: 'Redirecting to {redirectURL}...'
      }
    };
    app.verifyRules(rule, test.baseUrl + 'url/1', function(err, res) {
      expect(err).to.not.exist;
      expect(res.headers['content-type']).to.equal('text/plain');
      expect(res.body).to.equal('Redirecting to /url/2...');
      done();
    });
  });

  it('can output text/html content', function(done) {
    var rule = {
      from: '/url/1',
      to: {
        url: '/url/2',
        body: '<html><body>You\'re being redirected to <a href="{redirectURL}">another URL</a>.</body></html>'
      }
    };
    app.verifyRules(rule, test.baseUrl + 'url/1', function(err, res) {
      expect(err).to.not.exist;
      expect(res.headers['content-type']).to.equal('text/html');
      expect(res.body).to.equal('<html><body>You\'re being redirected to <a href="/url/2">another URL</a>.</body></html>');
      done();
    });
  });

  it('can output application/xml content', function(done) {
    var rule = {
      from: '/url/1',
      to: {
        url: '/url/2',
        body: '<response redirect="{redirectURL}"/>'
      }
    };
    app.verifyRules(rule, test.baseUrl + 'url/1', function(err, res) {
      expect(err).to.not.exist;
      expect(res.headers['content-type']).to.equal('application/xml');
      expect(res.body).to.equal('<response redirect="/url/2"/>');
      done();
    });
  });

  it('can output application/json content', function(done) {
    var rule = {
      from: '/url/1',
      to: {
        url: '/url/2',
        body: { redirect: "{redirectURL}" }
      }
    };
    app.verifyRules(rule, test.baseUrl + 'url/1', function(err, res) {
      expect(err).to.not.exist;
      expect(res.headers['content-type']).to.equal('application/json');
      expect(JSON.parse(res.body)).to.deep.equal({ redirect: '/url/2' });
      done();
    });
  });

  it('preserves any previously-specified content-type', function(done) {
    var rule = {
      from: '/url/1',
      to: {
        url: '/url/2',
        body: '<redirecting...>',
        headers: { 'content-type': 'text/plain' }
      }
    };
    app.verifyRules(rule, test.baseUrl + 'url/1', function(err, res) {
      expect(err).to.not.exist;
      expect(res.headers['content-type']).to.equal('text/plain');
      expect(res.body).to.equal('<redirecting...>');
      done();
    });
  });

  after(function(done) {
    app.stop(done);
  });
});
