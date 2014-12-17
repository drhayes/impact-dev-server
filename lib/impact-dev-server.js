var fs = require('fs'),
  util = require('util'),
  connect = require('connect'),
  editor = require('./editor'),
  puer = require('puer'),
  http = require('http');

module.exports = function(options) {
  var app = connect(),
    server = http.createServer(app),
    rootPath = require('path').resolve(options.root);

  app.use(connect.urlencoded())
    .use(connect.json())
    .use(connect.query())
    .use(editor(options.root));

  if (options.reload) {
    app.use(puer.connect(app, server, {
      dir: rootPath,
      ignored: /(\/|^)\..*|(lib\/game\/levels\/.+)/
    }));
  }

  app.use(connect.static(rootPath));
  server.listen(options.port);
};
