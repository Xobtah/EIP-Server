/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let SovietIO = require('socket.io');

let links = new Map();

let commands = require('./commands');
let dataChannel = require('./data');

function goodFormat(channel, data) {
    switch (channel) {
        case 'command':
            if (!data) return ('Data is empty');
            if (data.link_id == undefined) return ('No link_id provided');
            if (!data.body || data.body == undefined) return ('No body provided');
            if (data.body.command == undefined) return ('No command provided');
            if (data.body.command == 'link' && data.type == undefined) return ('No type provided');
            return (0);
        case 'data':
            if (!data) return ('Data is empty');
            if (data.link_id == undefined) return ('No link_id provided');
            if (!data.body || data.body == undefined) return ('No body provided');
            if (data.body.module == undefined) return ('No module provided');
            if (data.body.value == undefined) return ('No value provided');
            return (0);
        case 'error':
            if (!data) return ('Data is empty');
            if (data.link_id == undefined) return ('No link_id provided');
            if (!data.body || data.body == undefined) return ('No body provided');
            if (data.body.value == undefined) return ('No value provided');
            return (0);
        default:
            return (0);
    }
}

function checkThatReceivedDataIsAnObjectAndNotAString(data) {
    if (typeof data !== 'object')
        data = JSON.parse(data);
    return (data);
}

module.exports = function (httpServer) {
    if (!httpServer)
        throw new Error('Empty httpServer!');
    let io = SovietIO(httpServer);

    io.on('connection', (socket) => {
        console.log('WebSocket Connection');
        let link_id = null;

        socket.emit('info', 'You are connected to the server');

        socket.on('data', (data) => {
            try { data = checkThatReceivedDataIsAnObjectAndNotAString(data); }
            catch (err) { return (socket.emit('info', 'Received object is not a JSON')); }
            let errorMessage = null;
            if (errorMessage = goodFormat('data', data))
                return (socket.emit('info', errorMessage));

            dataChannel(data, links, socket);
        });

        socket.on('command', (data) => {
            try { data = checkThatReceivedDataIsAnObjectAndNotAString(data); }
            catch (err) { return (socket.emit('info', 'Received object is not a JSON')); }
            let errorMessage = null;
            if (errorMessage = goodFormat('command', data))
                return (socket.emit('info', errorMessage));

            console.log('Received packet on channel "command": ' + JSON.stringify(data));

            if (commands[data.body.command])
                commands[data.body.command](data, links, socket);
            else
                socket.emit('info', 'Unknown command: ' + data.body.command);
        });

        socket.on('error', (data) => {
            try { data = checkThatReceivedDataIsAnObjectAndNotAString(data); }
            catch (err) { return (socket.emit('info', 'Received object is not a JSON')); }
            let errorMessage = null;
            if (errorMessage = goodFormat('error', data))
                return (socket.emit('info', errorMessage));

            console.log('Error: ' + data.link_id + ':' + data.body.value);
            if (!links.has(data.link_id))
                return ;
            links.get(data.link_id).forEach((link) => {
                if (link.socket !== socket)
                    link.socket.emit('data', data.body.value);
            });
        });

        socket.on('disconnect', () => {
            if (!socket.link_id || !links.has(socket.link_id))
                return;

            let linkArray = links.get(socket.link_id);

            linkArray.forEach((link, i) => {
                if (link.socket !== socket)
                    link.socket.emit('info', 'Apparel disconnected');
                else
                    linkArray.splice(i, 1);
            });

            if (!linkArray.length)
                links.delete(socket.link_id);
        });
    });
}
