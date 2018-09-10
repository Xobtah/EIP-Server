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
let fileUpload = require('express-fileupload');

// middlewares
let bodyParser = require('body-parser');
let Morgan = require('morgan');

// database
let mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

// adding middlewares
if (process.env.NODE_ENV !== 'test')
    app.use(Morgan('combined'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload());

// adding models
require('./models');

// routing
app.use(require('./routes'));
require('./websocket')(httpServer);

// connect to mongo & run the app
mongoose.connect(config.mongoURL || 'mongodb://mdb:27017/sportsfun',
		 { useNewUrlParser: true })
    .then(() => httpServer.listen(config.post || 8080, () => console.log('App is listening! :)')))
    .catch(console.log);

module.exports = app;

module.exports.stop = function () {
    app.stop();
};
