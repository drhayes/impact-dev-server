# impact-dev-server: a command-line http server for ImpactJS

Setting up XAMP for [ImpactJS][impactjs] is an unnecessary pain. Apache caches resources. Apache requires configuration. Do you really need to be running MySQL to develop a JavaScript game?

Using Python's SimpleHTTPServer causes its own headaches: it's slow, it can quickly get overwhelmed by requests and start randomly 404ing.

Since the game you're writing is in JavaScript, why not run a server written in JavaScript? Hence this project.

**Do not use this server in production**. It exposes Weltmeister and is not written with an eye towards anything resembling security. Seriously, just don't.

## Install

Install via `npm`. If you don't have `npm` yet:

     curl http://npmjs.org/install.sh | sh

Once you have `npm`:

     npm install impact-dev-server -g

This will install `impact-dev-server` globally so that it may be run from the command line.

## Usage:

     impact-dev-server [path] [options]

`[path]` defaults to `./`.

## Available Options:

`-p` Port to listen for connections on (defaults to 8080)

`-a` Address to bind to (defaults to '0.0.0.0')

`-i` Display autoIndex (defaults to 'True')

`-e` or `--ext` Default file extension (defaults to 'html')

`-s` or `--silent` In silent mode, log messages aren't logged to the console.

`-h` or `--help` Displays a list of commands and exits.

`-c` Set cache time (in seconds) for cache-control max-age header, e.g. -c10 for 10 seconds. To disable caching, use -c-1.

  [impactjs]: http://impactjs.com
