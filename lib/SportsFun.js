/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let Utils = require('./Utils');

let SportsFun = {
    Server: require('./Server'),
    DataBase: require('./DataBase/DataBase'),
    Websocket: require('./Websocket/Websocket'),
    Utils: Utils
}

module.exports = SportsFun;
