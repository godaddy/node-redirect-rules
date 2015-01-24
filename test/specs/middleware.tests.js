var chai = require('chai');
var expect = chai.expect;
var test = require('./../util');

var http = require('http');

describe('The connect-redirector middleware', function() {
  var app;

  before(function(done) {
    test.startHTTPApp(function(err, result) {
      app = result;
      done(err);
    });
  });

  describe('when a match is encountered', function() {
    it('performs a 301 redirect by default', function(done) {
      var targetUrl = '/target/path';

      app.verifyRules({ from: '/some/path', to: targetUrl }, 'http://localhost:51789/some/path', function(err, res) {
        expect(err).to.not.exist;
        expect(res.statusCode).to.equal(301);
        expect(res.headers.location).to.equal(targetUrl);
        done();
      });
    });

    it('performs a 302 redirect if specified', function(done) {
      var targetUrl = '/target/path';
      var rule = { from: '/some/path', to: targetUrl, status: 302 };

      app.verifyRules(rule, 'http://localhost:51789/some/path', function(err, res) {
        expect(err).to.not.exist;
        expect(res.statusCode).to.equal(302);
        expect(res.headers.location).to.equal(targetUrl);
        done();
      });
    });
  });

  it('does not redirect when there\'s no exact match', function(done) {
    var rule = { from: '/some/path', to: '/target/path' };

    app.verifyRules(rule, 'http://localhost:51789/another/path', function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(204);
      done();
    });
  });

  it('does not redirect when there\'s no regex match', function(done) {
    var rule = { from: /\/some\/path/, to: '/target/path' };

    app.verifyRules(rule, 'http://localhost:51789/another/path', function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(204);
      done();
    });
  });

  it('handles an array of rules', function(done) {
    var rules = [
      { from: '/path/a', to: '/path/b' },
      { from: '/path/c', to: '/path/d' }
    ];

    app.verifyRules(rules, 'http://localhost:51789/path/c', function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(301);
      expect(res.headers.location).to.equal('/path/d');
      done();
    });
  });

  it('fails a match when unknown match conditions are encountered', function(done) {
    var rules = [
      { from: { lastName: 'Jones' }, to: '/some/path' }
    ];

    app.verifyRules(rules, 'http://localhost:51789/', function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(204);
      done();
    });
  });

  it('supports positional regex match variables in target URLs', function(done) {
    var rules = [
      { from: /\/(.*?)\/(.*)/, to: '/{url$1}s/{url$2}' }
    ];

    app.verifyRules(rules, 'http://localhost:51789/customer/263', function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(301);
      expect(res.headers.location).to.equal('/customers/263');
      done();
    });
  });

  it('removes unknown placeholders from target URLs', function(done) {
    var rules = [
      { from: /.*/, to: '/{unknown}/{url}' }
    ];

    app.verifyRules(rules, 'http://localhost:51789/customer/263', function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(301);
      expect(res.headers.location).to.equal('/customer/263');
      done();
    });
  });

  it('does not replace the leading double-slash from no-schema URLs', function(done) {
    var rules = [
      { from: /.*/, to: '//otherhost.com/{url}' }
    ];

    app.verifyRules(rules, 'http://localhost:51789/customer/263', function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(301);
      expect(res.headers.location).to.equal('//otherhost.com/customer/263');
      done();
    });
  });

  after(function(done) {
    app.stop(done);
  });
});
