var DEFAULT_PORT = 51789;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = {
  port: DEFAULT_PORT,
  baseUrl: 'http://127.0.0.1:' + DEFAULT_PORT + '/',
  secureBaseUrl: 'https://127.0.0.1:' + DEFAULT_PORT + '/',
  startHTTPApp: startHTTPApp,
  startHTTPSApp: startHTTPSApp
};

var util = require('util');
var path = require('path');
var fs = require('fs');
var http = require('http');
var https = require('https');
var connect = require('connect');
var request = require('request');
var createMiddleware = require('..');

function startHTTPApp(cb) {
  var app = new HTTPApplication();
  app.start(function(err) {
    cb(err, app);
  });
}

function startHTTPSApp(cb) {
  fs.readFile(path.resolve(__dirname, './files/fakedomain.com.pfx'), function(err, pfx) {
    var app = new HTTPSApplication(pfx);
    app.start(function(err) {
      cb(err, app);
    });
  });
}

function HTTPApplication(protocol, opts) {
  this.protocol = protocol || http;
  this.opts = opts;
  this.sockets = {};
  this.middleware = null;
  this.server = null;
}

HTTPApplication.prototype = {

  start: function (cb) {
    var nextSocketId = 0;

    var connectApp = connect();
    connectApp
      .use(function (req, res, next) {
        this.middleware ? this.middleware(req, res, next) : next();
      }.bind(this))
      .use(function (req, res) {
        res.statusCode = 204;
        res.end();
      });

    var createServer = this.opts
      ? this.protocol.createServer.bind(this.protocol, this.opts, connectApp)
      : this.protocol.createServer.bind(this.protocol, connectApp);

    this.server = createServer()
      .on('connection', function (socket) {
        var socketId = nextSocketId++;
        this.sockets[socketId] = socket;
        socket.on('close', function () {
          delete this.sockets[socketId];
        }.bind(this));
      }.bind(this))
      .listen(DEFAULT_PORT, cb);
  },

  verifyRules: function(rules, requestOpts, cb) {
    this.middleware = createMiddleware(rules);

    if (typeof(requestOpts) === 'string') {
      requestOpts = { url: requestOpts };
    }
    requestOpts.followRedirect = false;
    requestOpts.rejectUnauthorized = false;

    request(requestOpts, cb);
  },

  stop: function (cb) {
    Object.keys(this.sockets).forEach(function (socketId) {
      this.sockets[socketId].destroy();
    }, this);
    this.server.close(cb);
  }

};


util.inherits(HTTPSApplication, HTTPApplication);

function HTTPSApplication(pfx) {
  HTTPApplication.call(this, https, {
    pfx: pfx,
    passphrase: 'password',
    rejectUnauthorized: false
  });
}
