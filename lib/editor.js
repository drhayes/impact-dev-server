var director = require('director'),
  fs = require('fs'),
  path = require('path');

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

// Render weltmeister.html
router.get('/editor', function() {
  var fullPath = path.join(fileRoot, 'weltmeister.html');
  var self = this;
  fs.readFile(fullPath, function(err, data) {
    if (err) {
      genericError(self.res, err);
      return;
    }
    self.res.writeHead(200, {
      'Content-Length': data.length,
      'Content-Type': 'text/html'
    });
    self.res.write(data);
    self.res.close();
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
