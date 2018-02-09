/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let express = require('express');
let app = express();
//let httpServer = null;

let bodyParser = require('body-parser');
let Morgan = require('morgan');

let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/sportsfun');

app.use(Morgan('combined'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

require('./models/User.js');

app.use(require('./routes'));

//httpServer = require('http').createServer(app);
app.listen(8080, () => console.log('App is listening! :)'));
//httpServer.listen(8080, () => console.log('App is listening! :)'));
