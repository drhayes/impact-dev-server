var director = require('director');

var router = new director.http.Router();

// Expose the handler for all things Weltmeister related.
exports.handler = function(req, res) {
  var found = router.dispatch(req, res);
  if (!found) {
    // These aren't the endpoints you're looking for.
    res.emit('next');
  }
};