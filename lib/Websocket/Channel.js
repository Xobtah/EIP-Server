/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let Channel = function (io, channelName) {
    this.channel = io.of(channelName);
}

Channel.prototype.On = function (event, handler) {
    this.channel.on(event, handler);
    return (this);
}

Channel.prototype.Emit = function (event, data) {
    this.channel.emit(event, data);
    return (this);
}

module.exports = Channel;
