var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
// var monggoseFindAndFilter = require('mongoose-find-and-filter');
// mongoose.plugin(monggoseFindAndFilter);
var async = require('async');
var passport = require('passport');
var flash = require('connect-flash');
var shippo = require('shippo')('shippo_test_9b319216104d1b6935feadcdb86aa1027d620c11');

var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var createError = require('http-errors');
var session = require('express-session');

require('./config/passport.js')(passport);

var pug = require('pug');
var path = require('path');


app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({secret: 'dantheman'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// var indexRouter = require('./routes/index')(app, passport);
// var tradesRouter = require('./routes/trades')(app, passport);
// var userRouter = require('./routes/user')(app, passport);
require('./routes/routes.js')(app, mongoose, passport, async, shippo);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app.use('/', indexRouter);
// app.use('/trades', tradesRouter);
// app.use('/user', userRouter);

var configDB = require('./config/database.js');
mongoose.connect(configDB.url);
app.listen(port);
console.log('Server Started. Listening on port:[' + port + ']');

module.exports = session;
module.exports = app;
module.exports = async;
