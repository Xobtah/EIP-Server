/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let CollectionController = require('./CollectionController');

let Activities = function (db) {
    this.collection = db.collection('activities');
};

Activities.prototype = Object.create(CollectionController.prototype);
Activities.prototype.constructor = Activities;

module.exports = Activities;
