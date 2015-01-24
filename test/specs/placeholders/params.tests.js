var expect = require('chai').expect;
var test = require('../../util');

describe('The params placeholder', function() {
  var app;

  before(function(done) {
    test.startHTTPApp(function(err, result) {
      app = result;
      done(err);
    });
  });

  it('outputs a query string value', function(done) {
    var rule = { from: /.*/, to: 'http://{params.locale}.somedomain.com/{path}' };
    var opts = { url: 'http://127.0.0.1:51789/home?locale=es', headers: { host: 'somedomain.com' } };
    app.verifyRules(rule, opts, function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(301);
      expect(res.headers.location).to.equal('http://es.somedomain.com/home');
      done();
    });
  });

  after(function(done) {
    app.stop(done);
  });
});
