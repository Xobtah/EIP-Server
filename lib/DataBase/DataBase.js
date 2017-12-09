/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let Users = require('./Users');
let Posts = require('./Posts');
let Notifications = require('./Notifications');
let Activities = require('./Activities');

let DataBase = function (db) {
    if (!db)
        throw new Error('Empty data base');

    this.db = db;

    return ({
        Users: new Users(db),
        Posts: new Posts(db),
        Notifications: new Notifications(db),
        Activities: new Activities(db)
    });
}

module.exports = DataBase;
