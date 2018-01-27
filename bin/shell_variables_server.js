#!/usr/bin/env node

var shellVariables = require('shell-variables'),
    server;

server = new shellVariables.Server();

server.start(function (url) {
  console.log(url);
});
