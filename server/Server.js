/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let express = require('express');
let MongoClient = require('mongodb').MongoClient;
let app = express();

let DataBase = require('./DataBase/DataBase');

let Server = function (port, mongoURL) {
    this.port = port || 8080;
    this.mongoURL = mongoURL || 'mongodb://localhost:27017/sportsfun';

    this.db = null;

    return ({
        Init: function (callback) {
            MongoClient.connect(this.mongoURL, (err, db) => {
                if (err)
                    throw new Error('Failed to connect to MongoDB server');

                this.db = db;
                console.log('Connected correctly to MongoDB server');
                app.listen(this.port, () => {
                    console.log('Server listening on port ' + this.port);

                    if (callback && typeof callback === 'function')
                        callback(new DataBase(this.db));
                });
            });
        }.bind(this),

        Close: function () {
            if (db)
                db.close();
        },

        Route: function (method, route, callback) {
            if (!app[method])
                throw new Error('Unknown method: ' + method);

            app[method](route, callback);
        }
    });
};

module.exports = Server;
