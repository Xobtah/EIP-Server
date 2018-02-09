/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let express = require('express');

let MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;

let Morgan = require('morgan');
let bodyParser = require('body-parser');

let DataBase = require('./DataBase/DataBase');
let Websocket = require('./Websocket/Websocket');
let Utils = require('./Utils');

let LoginRoutes = require('./Routes/LoginRoutes');

let Server = function (config) {
    this.app = express();

    this.app.use(Morgan('combined'));

    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    //this.app.use(require('express-fileupload')());
    this.app.set('secret', config.secret || 'secret');

    this.httpServer = require('http').createServer(this.app);

    this.port = config.port || 8080;
    this.mongoURL = config.mongo || 'mongodb://localhost:27017/sportsfun';

    this.db = null;

    this.Websocket = new Websocket(this.httpServer);
    this.DataBase = null;
};

Server.prototype.Init = function (callback) {
    MongoClient.connect(this.mongoURL, (err, db) => {
        if (err)
            throw new Error('Failed to connect to MongoDB server');

        // Setting database
        this.db = db;
        this.DataBase = new DataBase(this.db);
        this.DataBase.ObjectID = ObjectID;
        console.log('Connected correctly to MongoDB server');

        // Adding routes that are used to log in
        LoginRoutes = new LoginRoutes(this);
        LoginRoutes.forEach((route) => {
            this.app[route.method](route.route, route.callback);
        });
        // Middleware for checking JWT
        this.app.use(function (req, res, next) {
            if (req.body.token) {
                Utils.JWT.verify(req.body.token, this.app.get('secret'), (err, decoded) => {
                    if (err)
                        return (res.status(500).send('Failed to authenticate token'));
                    req.token = decoded;
                    next();
                });
            }
            else
                return (res.status(403).send('No token provided'));
        }.bind(this));

        // Starting the HTTP & Websocket server
        this.httpServer.listen(this.port, () => {
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
