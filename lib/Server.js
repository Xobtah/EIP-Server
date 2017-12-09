/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let express = require('express');

let MongoClient = require('mongodb').MongoClient;

let bodyParser = require('body-parser');

let DataBase = require('./DataBase/DataBase');
let Websocket = require('./Websocket/Websocket');

let Server = function (config) {
    this.app = express();

    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    this.app.use(require('express-fileupload')());
    this.app.set('secret', config.secret || 'secret');

    this.port = config.port || 8080;
    this.mongoURL = config.mongo || 'mongodb://localhost:27017/sportsfun';

    this.db = null;

    this.Websocket = new Websocket();
    this.DataBase = null;
};

Server.prototype.Init = function (callback) {
    MongoClient.connect(this.mongoURL, (err, db) => {
        if (err)
            throw new Error('Failed to connect to MongoDB server');

        this.db = db;
        this.DataBase = new DataBase(this.db);
        console.log('Connected correctly to MongoDB server');
        this.app.listen(this.port, () => {
            console.log('Server listening on port ' + this.port);

            if (callback && typeof callback === 'function')
                callback(this.DataBase);
        });
    });
};

Server.prototype.Close = function () {
    if (db)
        db.close();
};

Server.prototype.Route = function (method, route, callback) {
    if (!this.app[method])
        throw new Error('Unknown method: ' + method);

    this.app[method](route, callback);
};

module.exports = Server;
