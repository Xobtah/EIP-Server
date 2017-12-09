/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let Channel = function (websocket, channel) {
    this.websocket = websocket;
    this.channel = channel;
}

Channel.prototype.On = function (event, handler) {
    this.channel.on(event, handler);
    return (this.websocket);
}

Channel.prototype.Emit = function (event, data) {
    this.channel.emit(event, data);
    return (this.websocket);
}

module.exports = Channel;
