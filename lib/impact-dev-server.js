const fs = require('fs');
const util = require('util');
const connect = require('connect');
const editor = require('./editor');
const puer = require('puer');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');

module.exports = function(options) {
  const app = connect();
  const server = http.createServer(app);
  const rootPath = path.resolve(options.root);

  app.use(bodyParser.urlencoded({
    extended: false,
  }))
    .use(bodyParser.json())
    // .use(bodyParser.query())
    .use(editor(options.root));

  if (options.reload) {
    app.use(puer.connect(app, server, {
      dir: rootPath,
      ignored: /(\/|^)\..*|(lib\/game\/levels\/.+)/
    }));
  }

  app.use(serveStatic(rootPath));
  server.listen(options.port);
};
