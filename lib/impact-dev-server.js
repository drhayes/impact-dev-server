var fs = require('fs');
var util = require('util');
var connect = require('connect');
var editor = require('./editor');

var ImpactDevServer = module.exports = function(options) {
  connect()
    .use(connect.bodyParser())
    .use(connect.query())
    .use(editor(options.root))
    .use(connect.static(require('path').resolve(options.root)))
    .listen(8080);
};
