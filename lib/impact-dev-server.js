var fs = require('fs'),
    util = require('util'),
    union = require('union'),
    ecstatic = require('ecstatic');

var HTTPServer = exports.HTTPServer = function (options) {
  options = options || {};

  if (options.root) {
    this.root = options.root;
  }
  else {
    try {
      fs.lstatSync('./public');
      this.root = './public';
    }
    catch (err) {
      this.root = './';
    }
  }
  
  if (options.headers) {
    this.headers = options.headers; 
  }

  // Do not cache any resources for any length of time.
  this.cache = 0; // in seconds.
  this.autoIndex = options.autoIndex !== false;

  if (options.ext) {
    this.ext = options.ext === true
      ? 'html'
      : options.ext;
  }

  var editorHandlers = [
    function(req, res) {
      console.log(req);
      res.emit('next');
    }
  ];

  var staticHandlers = ecstatic(this.root, {
    autoIndex: this.autoIndex,
    cache: this.cache,
    defaultExt: this.ext
  });

  var handlers = editorHandlers.concat(staticHandlers);

  this.server = union.createServer({
    before: handlers,
    headers: this.headers || {}
  });
};

HTTPServer.prototype.listen = function () {
  this.server.listen.apply(this.server, arguments);
};

HTTPServer.prototype.close = function () {
  return this.server.close();
};

exports.createServer = function (options) {
  return new HTTPServer(options);
};
