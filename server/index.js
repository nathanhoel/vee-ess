/*jslint node: true */
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var hbs  = require('express-handlebars');

var game = require('./routes/game');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', hbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// setup middleware
app.use('/assets', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', game);

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err);
  });
}

server = require('http').createServer(app);
require('./routes/socket')(server);

module.exports = server;
