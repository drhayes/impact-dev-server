const fs = require('fs');
const path = require('path');
const globFunc = require('glob');
const url = require('url');
const _ = require('lodash');
const debug = require('debug')('impact-dev-server:editor');

function unixPathJoin(...args) {
  return path.join(...args).replace(/\\/g, '/');
}

function unixPathRelative(...args) {
  return path.relative(...args).replace(/\\/g, '/');
}

const imageTypes = ['.png', '.jpg', '.jpeg', '.gif'];

const saveErrorCodes = {
  OK: 0,
  NO_PATH_OR_DATA: 1,
  COULD_NOT_WRITE_FILE: 2,
  WRONG_SUFFIX: 3
};

// Set when the editor handler is exported.
let fileRoot;

function globFiles(globPattern) {
  return new Promise((resolve, reject) => {
    globFunc(globPattern, (err, files) => {
      if (err) {
        reject(new Error(err));
      }
      else {
        resolve(files);
      }
    });
  });
}

function findDirs(dir) {
  return file => new Promise((resolve, reject) => {
    fs.stat(unixPathJoin(dir, file), (err, stats) => {
      if (err) {
        reject(new Error(err));
      }
      else {
        resolve({
          file,
          isDirectory: stats.isDirectory()
        });
      }
    });
  });
}

const typeHandlers = {
  scripts(file) {
    return path.extname(file) === '.js';
  },
  images(file) {
    return imageTypes.indexOf(path.extname(file)) !== -1;
  }
};

function findFilesOfType(type) {
  return file => new Promise(resolve => {
    const isOfType = typeHandlers[type](file);
    resolve(isOfType ? file : null);
  });
}

function globHandler(request, response) {
  if (!request.query.glob) {
    response.status(500).send('Badly formed glob request\n');
    return;
  }
  const globbedFiles = request.query.glob.map(filename => unixPathJoin(fileRoot, filename));
  debug(globbedFiles);
  Promise.all(globbedFiles.map(globFiles))
    .then(files => {
      debug(files);
      const flattenedFiles = _.flatten(files);
      const relativedFiles = flattenedFiles.map(file => unixPathRelative(fileRoot, file));
      response.json(relativedFiles);
    })
    .catch(err => {
      response.status(500).send(err);
    });
}

function browseHandler(request, response) {
  const dir = unixPathJoin(fileRoot, request.query.dir || '');
  debug(dir);
  fs.readdir(dir, (err, files) => {
    if (err) {
      throw err;
    }
    let parent = path.dirname(request.query.dir);
    if (!request.query.dir) {
      parent = '';
    }
    const result = {
      parent
    };
    const gotDirs = Promise.all(files.map(findDirs(dir)))
      .then(dirs => {
        result.dirs = dirs.reduce((accumulator, candidate) => {
          if (candidate.isDirectory) {
            accumulator.push(unixPathJoin(request.query.dir, candidate.file));
          }
          return accumulator;
        }, []);
      });
    const gotFiles = Promise.all(files.map(findFilesOfType(request.query.type)))
      .then(filesToProcess => {
        result.files = filesToProcess.reduce((accumulator, file) => {
          if (file) {
            accumulator.push(unixPathJoin(request.query.dir, file));
          }
          return accumulator;
        });
      });
    Promise.all([gotDirs, gotFiles])
      .then(() => {
        response.json(result);
      })
      .catch(err => {
        response.status(500).send(err);
      });
  });
}

function saveHandler(request, response) {
  const result = {
    error: saveErrorCodes.OK
  };
  if (!request.body.path || !request.body.data) {
    result.error = saveErrorCodes.NO_PATH_OR_DATA;
    result.msg = 'No Data or Path specified';
    response.json(result);
    return;
  }
  if (request.body.path.substr(-2) !== 'js') {
    result.error = saveErrorCodes.WRONG_SUFFIX;
    result.msg = 'File must have a .js suffix';
    response.json(result);
    return;
  }
  const fullPath = unixPathJoin(fileRoot, request.body.path);
  const { data } = request.body;
  fs.writeFile(fullPath, data, () => {
    response.json(result);
  });
}

// Expose the handler for all things Weltmeister related.
module.exports = function setEditorHandlers(app, root) {
  fileRoot = root;
  app.get('/lib/weltmeister/api/glob.php', globHandler);
  app.get('/lib/weltmeister/api/browse.php', browseHandler);
  app.post('/lib/weltmeister/api/save.php', saveHandler);
};
