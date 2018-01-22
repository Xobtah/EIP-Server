/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let io = require('socket.io');

let Channel = require('./Channel');

let Websocket = function (httpServer) {
    this.io = io.listen(httpServer);
    this.websocketChannels = new Map();

    this.channel = this.io;
}

Websocket.prototype = Object.create(Channel.prototype);
Websocket.prototype.constructor = Websocket;

Websocket.prototype.Channel = function (channelName) {
    if (!this.websocketChannels.get(channelName)) {
        let channel = new Channel(this.io, '/api/' + channelName);

        this.websocketChannels.set(channelName, channel);
        return (channel);
    }
    return (this.websocketChannels.get(channelName));
}

Websocket.prototype.DeleteChannel = function (channelName) {
    this.websocketChannels.delete(channelName);
    return (this);
}

module.exports = Websocket;
