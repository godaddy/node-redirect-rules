var expect = require('chai').expect;
var test = require('../../util');

describe('The params matcher', function() {
  var app;

  before(function(done) {
    test.startHTTPApp(function(err, result) {
      app = result;
      done(err);
    });
  });

  it('matches when all query string parameters match', function(done) {
    var rule = {
      from: { params: { mkt: /^(..)-(AR|BO|BR|CL|CO|CR|CU|DR|EC|SV|FG|GL|GU|HT|HO|MQ|MX|NG|PM|PG|PE|PR|SB|SM|UR|VZ)$/ } },
      to: '//latam.domain.com/{path}?lang={params.mkt$1}'
    };
    var opts = { url: test.baseUrl + 'rest/of/url?mkt=es-MX' };
    app.verifyRules(rule, opts, function(err, res) {
      expect(err).to.not.exist;
      expect(res.statusCode).to.equal(301);
      expect(res.headers.location).to.equal('//latam.domain.com/rest/of/url?lang=es');
      done();
    });
  });

  after(function(done) {
    app.stop(done);
  });
});
