/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let CollectionController = require('./CollectionController');

let Users = function (db) {
    this.collection = db.collection('users');
};

Users.prototype = Object.create(CollectionController.prototype);
Users.prototype.constructor = Users;

module.exports = Users;
