/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let SovietIO = require('socket.io');

let links = new Map();

let commands = require('./commands');

module.exports = function (httpServer) {
    if (!httpServer)
        throw new Error('Empty httpServer!');
    let io = SovietIO(httpServer);

    io.on('connection', (socket) => {
        console.log('WebSocket Connection');
        let link_id = null;

        socket.emit('info', 'You are connected to the server');
        socket.on('data', (data) => require('./data')(data, links, socket));

        socket.on('command', (data) => {
            if (commands[data.body.command])
                commands[data.body.command](data, links, socket);
        });
        socket.on('error', () => console.log('Received event on channel error'));
        socket.on('data', () => console.log('Received event on channel data'));

        socket.on('disconnect', (data) => {
            if (links.has(data.link_id))
                links.delete(link_id);
        });
    });
}
