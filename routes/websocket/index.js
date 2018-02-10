/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

module.exports = function (socket) {
    console.log('WebSocket Connection');
    socket.emit('command', require('./command'));
    socket.on('data', require('./data'));
};
