var fs = require('fs');
var util = require('util');
var connect = require('connect');
var editor = require('./editor');

var ImpactDevServer = module.exports = function(options) {
  connect()
    .use(connect.urlencoded())
    .use(connect.json())
    .use(connect.query())
    .use(editor(options.root))
    .use(connect.static(require('path').resolve(options.root)))
    .listen(options.port);
};
