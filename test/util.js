var path = require('path');
var fs = require('fs');
var util = require('util');
var http = require('http');
var https = require('https');
var url = require('url');
var connect = require('connect');
var request = require('request');
var createMiddleware = require('..');

var http2;
try {
  http2 = require('http2');
} catch (err) {
  // Support testing on platforms without http2
}

var DEFAULT_PORT = 51789;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = {
  port: DEFAULT_PORT,
  baseUrl: 'http://127.0.0.1:' + DEFAULT_PORT + '/',
  secureBaseUrl: 'https://127.0.0.1:' + DEFAULT_PORT + '/',
  supportsHttp2: !!http2,
  startHTTPApp,
  startHTTPSApp,
  startHTTP2App
};

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

function startHTTP2App(cb) {
  fs.readFile(path.resolve(__dirname, './files/fakedomain.com.pfx'), function(err, pfx) {
    var app = new HTTP2Application(pfx);
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

    this.server = this.createServer(connectApp)
      .on('connection', function (socket) {
        var socketId = nextSocketId++;
        this.sockets[socketId] = socket;
        socket.on('close', function () {
          delete this.sockets[socketId];
        }.bind(this));
      }.bind(this))
      .listen(DEFAULT_PORT, cb);
  },

  createServer: function(app) {
    return this.opts
      ? this.protocol.createServer(this.opts, app)
      : this.protocol.createServer(app);
  },

  verifyRules: function (rules, requestOpts, cb) {
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


util.inherits(HTTP2Application, HTTPSApplication);
function HTTP2Application(pfx) {
  HTTPSApplication.call(this, pfx);
}
HTTP2Application.prototype.createServer = function (app) {
  return http2.createSecureServer(this.opts, app);
};
HTTP2Application.prototype.verifyRules = function (rules, requestOpts, cb) {
  this.middleware = createMiddleware(rules);

  if (typeof(requestOpts) === 'string') {
    requestOpts = { url: requestOpts };
  }

  var parsedURL = url.parse(requestOpts.url);
  var session = http2.connect(`${parsedURL.protocol}//${parsedURL.host}`, {
    lookup: (hostname, opts, cb) => cb(null, '127.0.0.1', 4)
  });
  session
    .request({ ':path': parsedURL.pathname })
    .on('error', cb)
    .on('response', res => cb(null, res))
    .end();
};
