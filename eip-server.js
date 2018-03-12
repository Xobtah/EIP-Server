/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

// config
let config = require('./config');

// web server & rest routing
let express = require('express');
let app = express();
let httpServer = require('http').createServer(app);

// ws routing
let io = require('socket.io')(httpServer);

// middlewares
let bodyParser = require('body-parser');
let Morgan = require('morgan');

// database
let mongoose = require('mongoose');

// adding middlewares
app.use(Morgan('combined'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// adding models
require('./models');

// routing
app.use(require('./routes'));
io.on('connection', require('./routes/websocket'));

// connect to mongo & run the app
mongoose.connect(config.mongoURL || 'mongodb://localhost:27017/sportsfun')
    .then(() => httpServer.listen(config.post || 8080, () => console.log('App is listening! :)')))
    .catch(console.log);
