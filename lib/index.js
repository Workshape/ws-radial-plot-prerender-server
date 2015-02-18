var express = require('express'),
    color = require('cli-color'),
    routes = require('./routes');

var app = express(),
    server = app.listen(process.env.PORT || 2000, listen);

app.use('/', routes);

function listen() {
    console.log(color.cyan('Listening on http://localhost:' + server.address().port));
}