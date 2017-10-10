/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let CollectionController = require('./CollectionController');

let Posts = function (db) {
    this.collection = db.collection('posts');
};

Posts.prototype = Object.create(CollectionController.prototype);
Posts.prototype.constructor = Posts;

module.exports = Posts;
