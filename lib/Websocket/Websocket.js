/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let SocketIO = require('socket.io');

let Channel = require('./Channel');

let Websocket = function (expressApp) {
    this.io = SocketIO(require('http').createServer(expressApp));
    this.websocketChannels = new Map();

    this.websocket = this;
    this.channel = this.io;
}

Websocket.prototype = Object.create(Channel.prototype);
Websocket.prototype.constructor = Websocket;

Websocket.prototype.NewChannel = function (channelName) {
    console.log('Creating websocket channel: ' + channelName + ' (/api/' + channelName + ')');
    this.websocketChannels.set(channelName, new Channel(this, this.io.of('/api/' + channelName)));
    return (this);
};

Websocket.prototype.Channel = function (channelName) {
    if (!this.websocketChannels.get(channelName))
        throw new Error('Channel \'' + channelName + '\' does not exist');

    return (this.websocketChannels.get(channelName));
}

Websocket.prototype.DeleteChannel = function (channelName) {
    this.websocketChannels.delete(channelName);
    return (this);
}

module.exports = Websocket;
