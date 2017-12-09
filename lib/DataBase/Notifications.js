/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let CollectionController = require('./CollectionController');

let Notifications = function (db) {
    this.collection = db.collection('notifications');
};

Notifications.prototype = Object.create(CollectionController.prototype);
Notifications.prototype.constructor = Notifications;

module.exports = Notifications;
