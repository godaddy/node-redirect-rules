var expect = require('chai').expect;
var test = require('../../util');

describe('The port placeholder', function() {
  var app;

  before(function(done) {
    test.startHTTPApp(function(err, result) {
      app = result;
      done(err);
    });
  });

  it('outputs the port of the HTTP server', function(done) {
    var rule = { from: /.*/, to: 'http://someproxy/?host={hostname}&port={port}' };
    var opts = { url: 'http://localhost:51789/' };
    app.verifyRules(rule, opts, function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(301);
      expect(res.headers.location).to.equal('http://someproxy/?host=localhost&port=51789');
      done();
    });
  });

  after(function(done) {
    app.stop(done);
  });
});
