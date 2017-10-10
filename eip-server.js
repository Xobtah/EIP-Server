/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let SportsFun = require('./server/SportsFun');
let Server = new SportsFun.Server();

Server.Init(function (DataBase) {
    console.log('Server started!');
});
