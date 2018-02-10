/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let config = require('./config');

let express = require('express');
let app = express();
let httpServer = require('http').createServer(app);

let bodyParser = require('body-parser');
let Morgan = require('morgan');

let mongoose = require('mongoose');
let io = require('socket.io')(httpServer);

app.use(Morgan('combined'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

require('./models/User.js');
require('./models/Post.js');

app.use(require('./routes'));

mongoose.connect('mongodb://localhost:27017/sportsfun').then(() => httpServer.listen(config.post || 8080, () => console.log('App is listening! :)'))).catch(console.log);
