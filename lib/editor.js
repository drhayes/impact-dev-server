const fs = require('fs');
const path = require('path');
const globFunc = require('glob');
const Q = require('q');
const _ = require('lodash');

const unixPath = {
  join: function() {
    return path.join.apply(this, arguments).replace(/\\/g, '/');
  },
  relative: function() {
    return path.relative.apply(this, arguments).replace(/\\/g, '/');
  }
};

const imageTypes = ['.png', '.jpg', '.jpeg', '.gif'];

const saveErrorCodes = {
  OK: 0,
  NO_PATH_OR_DATA: 1,
  COULD_NOT_WRITE_FILE: 2,
  WRONG_SUFFIX: 3
};

// Set when the editor handler is exported.
let fileRoot;

const genericError = function(response, err) {
  response.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  response.end(err + '\n');
};

const globFiles = function(glob) {
  const deferred = Q.defer();
  globFunc(glob, function(err, files) {
    if (err) {
      deferred.reject(new Error(err));
    } else {
      deferred.resolve(files);
    }
  });
  return deferred.promise;
};

const findDirs = function(dir) {
  return function(file) {
    const deferred = Q.defer();
    fs.stat(unixPath.join(dir, file), function(err, stats) {
      if (err) {
        deferred.reject(new Error(err));
      } else {
        deferred.resolve({
          file: file,
          isDirectory: stats.isDirectory()
        });
      }
    });
    return deferred.promise;
  };
};

const typeHandlers = {
  scripts: function(file) {
    return path.extname(file) === '.js';
  },
  images: function(file) {
    return imageTypes.indexOf(path.extname(file)) !== -1;
  }
};

const findFilesOfType = function(type) {
  return function(file) {
    const deferred = Q.defer();
    const isOfType = typeHandlers[type](file);
    deferred.resolve(isOfType ? file : null);
    return deferred.promise;
  }
};

const sendJSON = function(response, result) {
  const data = JSON.stringify(result);
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  });
  response.end(data);
};

const glob = function() {
  if (!this.req.query.glob) {
    genericError(this.res, 'Badly formed glob request');
    return;
  }
  const globs = this.req.query.glob.map(function(glob) {
    return unixPath.join(fileRoot, glob);
  });
  const response = this.res;
  Q.all(globs.map(globFiles))
    .then(function(files) {
      files = _.flatten(files);
      files = files.map(function(file) {
        return unixPath.relative(fileRoot, file);
      });
      sendJSON(response, files);
    });
};

const browse = function() {
  const dir = unixPath.join(fileRoot, this.req.query.dir || '');
  const request = this.req;
  const response = this.res;
  fs.readdir(dir, function(err, files) {
    if (err) {
      throw err;
    }
    const parent = path.dirname(request.query.dir);
    if (!request.query.dir) {
      parent = '';
    }
    const result = {
      parent: parent
    };
    const gotDirs = Q.all(files.map(findDirs(dir)))
      .then(function(dirs) {
        result.dirs = _.compact(dirs.map(function(dir) {
          if (dir.isDirectory) {
            return unixPath.join(request.query.dir, dir.file);
          }
        }));
      });
    const gotFiles = Q.all(files.map(findFilesOfType(request.query.type)))
      .then(function(files) {
        result.files = _.map(_.compact(files), function(file) {
          return unixPath.join(request.query.dir, file);
        });
      });
    Q.all([gotDirs, gotFiles])
      .then(function() {
        sendJSON(response, result);
      });
  });
};

const save = function() {
  const result = {
    error: saveErrorCodes.OK
  };
  if (!this.req.body.path || !this.req.body.data) {
    result.error = saveErrorCodes.NO_PATH_OR_DATA;
    result.msg = 'No Data or Path specified';
    sendJSON(this.res, result);
    return;
  }
  if (this.req.body.path.substr(-2) !== 'js') {
    result.error = saveErrorCodes.WRONG_SUFFIX;
    result.msg = 'File must have a .js suffix';
    sendJSON(this.res, result);
    return;
  }
  const fullPath = unixPath.join(fileRoot, this.req.body.path);
  const data = this.req.body.data;
  const response = this.res;
  fs.writeFile(fullPath, data, function() {
    sendJSON(response, result);
  });
};

const handlers = {
  '/lib/weltmeister/api/glob.php': {
    method: 'GET',
    handler: glob
  },
  '/lib/weltmeister/api/browse.php': {
    method: 'GET',
    handler: browse
  },
  '/lib/weltmeister/api/save.php': {
    method: 'POST',
    handler: save
  }
};

// Expose the handler for all things Weltmeister related.
module.exports = function(root) {
  fileRoot = root;
  return function(req, res, next) {
    const parsedUrl = require('url').parse(req.url);
    const pathname = parsedUrl.pathname;
    const found = handlers.hasOwnProperty(pathname)
      && handlers[pathname].method === req.method;
    if (!found) {
      // These aren't the endpoints you're looking for.
      return next();
    } else {
      const handler = handlers[pathname].handler;
      handler.bind({
        req: req,
        res: res
      })();
    }
  }
};
