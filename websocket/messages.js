/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let Message = require('mongoose').model('Message');
let JWT = require('jsonwebtoken');
let config = require('./../config');

let usrData = { firstName: true, lastName: true, profilePic: true, _id: true };

module.exports.getSnippets = function (socket, data) {
    let token = null;

    console.log('Snippets: ' + JSON.stringify(data));
    if (!data.token)
        return (socket.emit('info', 'Missing param token'));
    try { token = JWT.verify(data.token, config.secret || 'secret'); }
    catch (err) { return (socket.emit('info', 'Failed to authenticate token')); }
    
    Message.find({ author: token._id }).distinct('to', (err, toIds) => {
        if (err)
            return (socket.emit('info', err));
        Message.find({ to: token._id }).distinct('author', (err, fromIds) => {
            if (err)
                return (socket.emit('info', err));
            let ids = _.union(fromIds, toIds);
            let messages = [];
            
            ids.forEach((id) => {
                Message.findOne({ $or: [ { author: token._id, to: id }, { author: id, to: token._id } ] }).sort('-createdAt').lean().exec((err, message) => {
                    if (err)
                        return (socket.emit('info', err));
                    if (!message)
                        return ;
                    User.find({ _id: { $in: [ message.author, message.to ] } }, usrData).then((users) => {
                        if (message.author == users[0]._id)
                            message.author = users[0];
                        if (message.author == users[1]._id)
                            message.author = users[1];
                        if (message.to == users[0]._id)
                            message.to = users[0];
                        if (message.to == users[1]._id)
                            message.to = users[1];
                        socket.emit('snippets', { id: (message.author == data.id ? message.to : message.author), message });
                    }).catch((err) => socket.emit('info', err));
                });
            });
        });
    });
};

module.exports.getConversation = function (socket, data) {
    let token = null;

    console.log('Conversation: ' + JSON.stringify(data));
    if (!data.id)
        return (socket.emit('info', 'Missing param id'));
    if (!data.token)
        return (socket.emit('info', 'Missing param token'));
    try { token = JWT.verify(data.token, config.secret || 'secret'); }
    catch (err) { return (socket.emit('info', 'Failed to authenticate token')); }

    Message.find({ $or: [ { author: token._id, to: data.id }, { author: data.id, to: token._id } ] }).sort('-createdAt').limit(30).lean().then((messages) => {
        if (!messages.length)
            return (socket.emit('conversation', { id: data.id, messages }));
        User.find({ _id: { $in: [ messages[0].author, messages[O].to ] } }, usrData).then((users) => {
            messages.forEach((message) => {
                if (message.author == users[0]._id)
                    message.author = users[0];
                if (message.author == users[1]._id)
                    message.author = users[1];
                if (message.to == users[0]._id)
                    message.to = users[0];
                if (message.to == users[1]._id)
                    message.to = users[1];
            });
            socket.emit('conversation', { id: data.id, messages });
        }).catch((err) => socket.emit('info', err));
    }).catch((err) => socket.emit('info', err));
};

module.exports.sendMessage = function (socket, data) {
    let token = null;

    console.log('Message: ' + JSON.stringify(data));
    if (!data.to)
        return (socket.emit('info', 'Missing param `to`'));
    if (!data.content)
        return (socket.emit('info', 'Missing param content'));
    if (!data.token)
        return (socket.emit('info', 'Missing param token'));
    try { token = JWT.verify(data.token, config.secret || 'secret'); }
    catch (err) { return (socket.emit('info', 'Failed to authenticate token')); }
    
    if (data.to == token._id)
        return (socket.emit('info', 'You cannot send a message to yourself'));
    let message = new Message();
    message.content = data.content;
    message.to = data.to;
    message.author = token._id;
    message.save((err) => {
        if (err)
            return (socket.emit('info', err));
        socket.emit('message', { success: true });
    });
};

module.exports.startWriting = function (socket, data) {

};

module.exports.stopWriting = function (socket, data) {

};
