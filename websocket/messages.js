/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let Message = require('mongoose').model('Message');
let JWT = require('jsonwebtoken');
let User = require('mongoose').model('User')
let _ = require('lodash');
let config = require('./../config');

let usrData = { firstName: true, lastName: true, profilePic: true, _id: true };

global.connectedUsers = new Map();

module.exports.registerMessages = function (socket, data) {
    let token = null;

    console.log('Register Messages: ' + JSON.stringify(data));
    if (!data.token)
        return (socket.emit('info', { message: 'Missing param token' }));
    try { token = JWT.verify(data.token, config.secret || 'secret'); }
    catch (err) { return (socket.emit('info', { message: 'Failed to authenticate token' })); }

    connectedUsers.set(token._id, socket);
    socket.userId = token._id;

    socket.emit('registerMessages', { message: 'OK' });
};

module.exports.getSnippets = function (socket, data) {
    console.log('Snippets: ' + JSON.stringify(data));
    if (!socket.userId)
        return (socket.emit('info', { message: 'Register before getting messages' }));
    Message.find({ author: socket.userId }).distinct('to', (err, toIds) => {
        if (err)
            return (socket.emit('info', err));
        Message.find({ to: socket.userId }).distinct('author', (err, fromIds) => {
            if (err)
                return (socket.emit('info', err));
            let ids = _.union(fromIds, toIds);
            let messages = [];
            
            ids.forEach((id) => {
                Message.findOne({ $or: [ { author: socket.userId, to: id }, { author: id, to: socket.userId } ] }).sort('-createdAt').lean().exec((err, message) => {
                    if (err)
                        return (socket.emit('info', err));
                    if (!message)
                        return ;
                    User.find({ _id: { $in: [ message.author, message.to ] } }, usrData).then((users) => {
                        if (message.author.equals(users[0]._id))
                            message.author = users[0];
                        if (message.author.equals(users[1]._id))
                            message.author = users[1];
                        if (message.to.equals(users[0]._id))
                            message.to = users[0];
                        if (message.to.equals(users[1]._id))
                            message.to = users[1];
                        socket.emit('snippets', { id: (message.author.equals(socket.userId) ? message.to : message.author), message });
                    }).catch((err) => socket.emit('info', err));
                });
            });
        });
    });
};

module.exports.getConversation = function (socket, data) {
    console.log('Conversation: ' + JSON.stringify(data));
    if (!socket.userId)
        return (socket.emit('info', { message: 'Register before getting messages' }));
    if (!data.id)
        return (socket.emit('info', { message: 'Missing param id' }));
    Message.find().or([ { author: socket.userId, to: data.id }, { author: data.id, to: socket.userId } ]).sort('-createdAt').limit(30).lean().then((messages) => {
        if (!messages.length)
            return (socket.emit('conversation', { id: data.id, messages }));
        User.find({ _id: { $in: [ messages[0].author, messages[O].to ] } }, usrData).then((users) => {
            messages.forEach((message) => {
                if (message.author.equals(users[0]._id))
                    message.author = users[0];
                if (message.author.equals(users[1]._id))
                    message.author = users[1];
                if (message.to.equals(users[0]._id))
                    message.to = users[0];
                if (message.to.equals(users[1]._id))
                    message.to = users[1];
            });
            socket.emit('conversation', { id: data.id, messages });
        }).catch((err) => socket.emit('info', { message: 'Users not found' }));
    }).catch((err) => socket.emit('info', { message: 'Messages not found' }));
};

module.exports.sendMessage = function (socket, data) {
    console.log('Message: ' + JSON.stringify(data));
    if (!socket.userId)
        return (socket.emit('info', { message: 'Register before getting messages' }));
    if (!data.to)
        return (socket.emit('info', { message: 'Missing param `to`' }));
    if (!data.content)
        return (socket.emit('info', { message: 'Missing param content' }));
    
    if (data.to.equals(socket.userId))
        return (socket.emit('info', { message: 'You cannot send a message to yourself' }));
    let message = new Message();
    message.content = data.content;
    message.to = data.to;
    message.author = socket.userId;
    message.save((err) => {
        if (err)
            return (socket.emit('info', err));
        if (connectedUsers.has(message.to))
            connectedUsers.get(message.to).emit('message', message);
        socket.emit('message', { success: true });
    });
};

module.exports.startWriting = function (socket, data) {
    console.log('Start Writing: ' + JSON.stringify(data));
    if (!socket.userId)
        return (socket.emit('info', { message: 'Register before getting messages' }));
    if (!data.id)
        return (socket.emit('info', { message: 'Missing param id' }));
    if (connectedUsers.has(data.id))
        connectedUsers.get(data.id).emit('startWriting', { id: socket.userId });
};

module.exports.stopWriting = function (socket, data) {
    console.log('Stop Writing: ' + JSON.stringify(data));
    if (!socket.userId)
        return (socket.emit('info', { message: 'Register before getting messages' }));
    if (!data.id)
        return (socket.emit('info', { message: 'Missing param id' }));
    if (connectedUsers.has(data.id))
        connectedUsers.get(data.id).emit('stopWriting', { id: socket.userId });
};
