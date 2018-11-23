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

global.connectedUsers = [];

module.exports.registerMessages = function (socket, data) {
    let token = null;

    console.log('Register Messages: ' + JSON.stringify(data));
    if (!data.token)
        return (socket.emit('info', { message: 'Missing param token' }));
    try { token = JWT.verify(data.token, config.secret || 'secret'); }
    catch (err) { return (socket.emit('info', { message: 'Failed to authenticate token' })); }

    connectedUsers.push({ userId: token._id, socketId: socket.id });
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
            let ids = _.uniqBy(_.union(fromIds, toIds), (e) => e.toString());
            let messages = [];

            ids.forEach((id) => {
                Message.findOne({ $or: [{ author: socket.userId, to: id }, { author: id, to: socket.userId }] }).sort('-createdAt').lean().exec((err, message) => {
                    if (err)
                        return (socket.emit('info', err));
                    if (!message)
                        return;
                    User.find({ _id: { $in: [message.author, message.to] } }, usrData).then((users) => {
                        if (message.author.equals(users[0]._id))
                            message.author = users[0];
                        else if (message.author.equals(users[1]._id))
                            message.author = users[1];
                        if (message.to.equals(users[0]._id))
                            message.to = users[0];
                        else if (message.to.equals(users[1]._id))
                            message.to = users[1];
                        socket.emit('snippets', { id: (message.author.equals(socket.userId) ? message.to._id : message.author._id), message });
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
    Message.find({ $or: [{ author: socket.userId, to: data.id }, { author: data.id, to: socket.userId }] }).sort('-createdAt').skip(data.page ? data.page * 30 : 0).limit(30).lean().then((messages) => {
        if (!messages.length)
            return (socket.emit('conversation', { id: data.id, messages }));
        User.find({ _id: { $in: [messages[0].author, messages[0].to] } }, usrData).then((users) => {
            messages.forEach((message) => {
                if (message.author.equals(users[0]._id))
                    message.author = users[0];
                else if (message.author.equals(users[1]._id))
                    message.author = users[1];
                if (message.to.equals(users[0]._id))
                    message.to = users[0];
                else if (message.to.equals(users[1]._id))
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

    if (data.to == socket.userId)
        return (socket.emit('info', { message: 'You cannot send a message to yourself' }));

    User.find({ _id: { $in: [ socket.userId, data.to ] } }, usrData).then((users) => {
        let message = new Message();
        message.content = data.content;
        message.to = data.to;
        message.author = socket.userId;

        if (message.author.toString() == users[0]._id.toString())
            message.author = users[0];
        else if (message.author.toString() == users[1]._id.toString())
            message.author = users[1];
        if (message.to.toString() == users[0]._id.toString())
            message.to = users[0];
        else if (message.to.toString() == users[1]._id.toString())
            message.to = users[1];
        message.save((err) => {
            if (err)
                return (socket.emit('info', err));
            connectedUsers.forEach((user) => {
                if (user.userId == message.to)
                    socket.broadcast.to(user.socketId).emit('message', message);
            });
            socket.emit('info', { success: true, message });
        });
    }).catch((err) => socket.emit('info', { message: 'Users not found' }));
};

module.exports.startWriting = function (socket, data) {
    console.log('Start Writing: ' + JSON.stringify(data));
    if (!socket.userId)
        return (socket.emit('info', { message: 'Register before getting messages' }));
    if (!data.id)
        return (socket.emit('info', { message: 'Missing param id' }));
    connectedUsers.forEach((user) => {
        if (user.userId == message.to)
            socket.broadcast.to(user.socketId).emit('startWriting', { id: socket.userId });
    });
};

module.exports.stopWriting = function (socket, data) {
    console.log('Stop Writing: ' + JSON.stringify(data));
    if (!socket.userId)
        return (socket.emit('info', { message: 'Register before getting messages' }));
    if (!data.id)
        return (socket.emit('info', { message: 'Missing param id' }));
    connectedUsers.forEach((user) => {
        if (user.userId == message.to)
            socket.broadcast.to(user.socketId).emit('stopWriting', { id: socket.userId });
    });
};
