const express = require('express');
const puer = require('puer');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const setEditorHandlers = require('./editor');

module.exports = function impactDevServer(options) {
  const app = express();
  const server = http.createServer(app);
  const rootPath = path.resolve(options.root);

  app.use(bodyParser.urlencoded({
    extended: false,
  }))
    .use(express.json());

  setEditorHandlers(app, options.root);

  if (options.reload) {
    app.use(puer.express(app, server, {
      dir: rootPath,
      ignored: /(\/|^)\..*|(lib\/game\/levels\/.+)/
    }));
  }

  app.use(express.static(rootPath));
  server.listen(options.port);
};
