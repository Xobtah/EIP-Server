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
	    console.log('Received packet on channel "command": ' + JSON.stringify(data));
	    if (!data) socket.emit('error', 'Missing data');
	    if (!data.body) socket.emit('error', 'Missing body in data');
	    if (!data.body.command) socket.emit('error', 'Missing command in body in data');
            if (data && data.body && commands[data.body.command])
                commands[data.body.command](data, links, socket);
        });

        socket.on('error', () => console.log('Received event on channel error'));

        socket.on('disconnect', (data) => {
            if (links.has(data.link_id))
                links.delete(link_id);
        });
    });
}
