var director = require('director'),
  fs = require('fs'),
  path = require('path'),
  globFunc = require('glob'),
  Q = require('q'),
  _ = require('underscore');

var router = new director.http.Router();

// Set when the editor handler is exported.
var fileRoot;

var genericError = function(response, err) {
  response.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  response.write(err + '\n');
  response.close();
};

var globFiles = function(glob) {
  var deferred = Q.defer();
  globFunc(glob, function(err, files) {
    if (err) {
      deferred.reject(new Error(err));
    } else {
      deferred.resolve(files);
    }
  });
  return deferred.promise;
};

router.get('/lib/weltmeister/api/glob.php', function() {
  if (!this.req.query.glob) {
    genericError(this.res, 'Badly formed glob request');
    return;
  }
  var globs = this.req.query.glob.map(function(glob) {
    return path.join(fileRoot, glob);
  });
  var self = this;
  Q.all(globs.map(globFiles))
    .then(function(files) {
      files = _.flatten(files);
      files = files.map(function(file) {
        return path.relative(fileRoot, file);
      });
      var data = JSON.stringify(files);
      self.res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      });
      self.res.end(data);
    });
});

// Expose the handler for all things Weltmeister related.
exports.handler = function(root) {
  fileRoot = root;
  return function(req, res) {
    var found = router.dispatch(req, res);
    if (!found) {
      // These aren't the endpoints you're looking for.
      res.emit('next');
    }
  }
};
