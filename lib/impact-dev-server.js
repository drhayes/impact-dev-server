var fs = require('fs'),
  util = require('util'),
  connect = require('connect'),
  editor = require('./editor'),
  puer = require('puer'),
  http = require('http');

module.exports = function(options) {
  var WATCH_OPTION = {
    dir: require('path').resolve(options.root),
    ignored: /(\/|^)\..*|lib\/game\/levels/
  };

  var app = connect(),
    server = http.createServer(app);

  app.use(connect.urlencoded())
    .use(connect.json())
    .use(connect.query())
    .use(editor(options.root))
    .use(puer.connect(app, server, WATCH_OPTION))
    .use(connect.static(require('path').resolve(options.root)));

  server.listen(options.port);
};
