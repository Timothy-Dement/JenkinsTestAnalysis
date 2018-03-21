var istanbul = require('istanbul-middleware');

istanbul.hookLoader(__dirname);

var express = require('express');
var server = require('./server.js');

var app = express();

app.use('/coverage', istanbul.createHandler());
app.listen(8888);