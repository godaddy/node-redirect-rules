var expect = require('chai').expect;
var test = require('../../util');

describe('The status outputter', function() {
  var app;

  before(function(done) {
    test.startHTTPApp(function(err, result) {
      app = result;
      done(err);
    });
  });

  it('defaults to outputting 301', function(done) {
    var rule = {
      from: '/url/1',
      to: '/url/2'
    };
    app.verifyRules(rule, test.baseUrl + 'url/1', function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(301);
      done();
    });
  });

  it('is populated by having a status property in the rule', function(done) {
    var rule = {
      from: '/url/1',
      to: '/url/2',
      status: 302
    };
    app.verifyRules(rule, test.baseUrl + 'url/1', function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(302);
      done();
    });
  });

  it('can be specified in the "to" specifier', function(done) {
    var rule = {
      from: '/url/1',
      to: { url: '/url/2', status: 302 }
    };
    app.verifyRules(rule, test.baseUrl + 'url/1', function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(302);
      done();
    });
  });

  after(function(done) {
    app.stop(done);
  });
});
