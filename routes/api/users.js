/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let config = require('./../../config');
let User = require('mongoose').model('User');
let JWT = require('jsonwebtoken');
let mid = require('./../middlewares');

router.get('/', mid.checkUser, (req, res) => {
    User.find({}, (err, users) => {
        res.status(200).send(users);
    });
});

router.get('/self', mid.checkUser, (req, res) => {
    res.status(200).send({ success: true, message: 'OK', data: req.user });
});

router.post('/edit/info', mid.token, mid.optionalFields([ 'username', 'email', 'firstName', 'lastName', 'birthDate', 'password' ]), (req, res) => {
    User.getById(req.token._id, (err, user) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        for (key in req.fields)
            user[key] = req.fields[key];
        if (req.fields.password)
            user.setPassword(req.fields.password);
        user.save((err) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'User ' + req.fields.firstName + ' ' + req.fields.lastName + ' has been inserted' });
        });
    });
});

router.post('/register', mid.fields([ 'username', 'email', 'firstName', 'lastName', 'birthDate', 'password' ]), (req, res) => {
    console.log('reg');
    let user = new User();
    for (key in req.fields)
        user[key] = req.fields[key];
    user.friends = [];
    if (req.body.bio)
        user.bio = req.body.bio;
    user.setPassword(user.password, (err) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        user.save((err) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'User ' + req.fields.firstName + ' ' + req.fields.lastName + ' has been inserted' });
        });
    });
});

router.post('/login', mid.fields([ 'username', 'password' ]), (req, res) => {
    User.getUserByUsername(req.fields.username, (err, user) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        if (!user)
            return (res.status(500).send({ success: false, message: 'User \'' + req.fields.username + '\' does not exist' }));
        user.tryPassword(req.fields.password).then((samePassword) => {
            if (!samePassword)
                return (res.status(403).send({ success: false, message: 'Incorrect password' }));
            JWT.sign({ _id: user._id }, config.secret || 'secret', (err, token) => {
                if (err)
                    return (res.status(500).send({ success: false, message: err }));
                res.status(200).send({ success: true, message: 'Logged in', data: { token } });
            });
        }).catch((err) => res.status(500).send({ success: false, message: err }));
    });
});

router.post('/edit/password', mid.checkLogin, mid.fields([ 'newPassword' ]), (req, res) => {
    req.user.setPassword(req.fields.newPassword, (err) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'Password has been changed' });
    });
});

router.post('/edit/email', mid.checkLogin, mid.fields([ 'email' ]), (req, res) => {
    req.user.updateEmail(req.fields.email, (err) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'Email has been changed' });
    });
});

router.delete('/', mid.checkLogin, (req, res) => {
    req.user.remove((err, user) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'User ' + user.firstName + ' ' + user.lastName + ' has been deleted' });
    });
});

module.exports = router;
