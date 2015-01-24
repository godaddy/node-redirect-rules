var expect = require('chai').expect;
var test = require('../../util');

describe('The method placeholder', function() {
  var app;

  before(function(done) {
    test.startHTTPApp(function(err, result) {
      app = result;
      done(err);
    });
  });

  it('outputs the lower-cased method (verb) of the request', function(done) {
    var rule = { from: /.*/, to: '/some/silly/api/{method}/{path}' };
    var opts = { url: test.baseUrl + 'foo/bar' };
    app.verifyRules(rule, opts, function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(301);
      expect(res.headers.location).to.equal('/some/silly/api/get/foo/bar');
      done();
    });
  });

  after(function(done) {
    app.stop(done);
  });
});
