# impact-dev-server: a command-line http server for ImpactJS

Setting up XAMP for [ImpactJS][impactjs] is an unnecessary pain. Apache caches
resources. Apache requires configuration. Do you really need to be running
MySQL to develop a JavaScript game?

Using Python's SimpleHTTPServer causes its own headaches: it's slow, it can
quickly get overwhelmed by requests and start randomly 404ing.

Since the game you're writing is in JavaScript, why not run a server written in
JavaScript?

Hence this project.

**Do not use this server in production**. It exposes Weltmeister and is
not written with an eye towards anything resembling security.
Seriously, just don't.

## Install

Install via `npm`. If you don't have `npm` yet:

     curl http://npmjs.org/install.sh | sh

Once you have `npm`:

     npm install impact-dev-server -g

This will install `impact-dev-server` globally so that it may be run from the
command line.

## Usage:

     impact-dev-server [-p port] [-r] [path]

`[path]` defaults to `./`. Optional.
`-p port` defaults to 8080. Optional.
`-r` will start a live-reload server. The page will automatically reload when
you change your game's files. Defaults to no live reload. Optional. See section
below for some caveats.

## Live Reload

Very handy for quick edit-and-test cycle when messing around with entities. This
option *will not* reload when levels are saved in Weltmeister, however. You'll
have to do that yourself.

## Contributors!

* Thanks to [pixelpicosean][] for the live reload feature.

[impactjs]: http://impactjs.com
[pixelpicosean]: https://github.com/pixelpicosean
