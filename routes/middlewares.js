/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let JWT = require('jsonwebtoken');
let User = require('mongoose').model('User');
let config = require('./../config');

function setTokenFromBody(req, res, next) {
    if (req.body.token) {
        JWT.verify(req.body.token, config.secret || 'secret', (err, decoded) => {
            if (err)
                return (res.status(500).send('Failed to authenticate token'));
            req.token = decoded;
            next();
        });
    }
    else
        return (res.status(403).send('No token provided'));
}

function setUserFromToken(req, res, next) {
    if (!req.token)
        return (res.status(500).send({ success: false, message: 'Token not set' }));
    User.findById(req.token._id, (err, user) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        req.user = user;
        next();
    });
}

function checkUserPassword(req, res, next) {
    if (!req.user)
        return (res.status(500).send({ success: false, message: 'User not set' }));
    if (!req.body.password)
        return (res.status(401).send('Missing key \'password\' in body'));
    req.user.tryPassword(req.body.password).then((samePassword) => {
        if (!samePassword)
            return (res.status(500).send({ success: false, message: 'Incorrect password' }));
        next();
    });
}

function checkFields(body, fields, success, error) {
    let object = {};
    let operationSuccess = false;

    operationSuccess = fields.every((key) => {
        if (!body[key]) {
            if (typeof error == 'function')
                error(key);
            return (false);
        }
        object[key] = body[key];
        return (true);
    });
    if (operationSuccess)
        success(object);
}

module.exports = {
    token () {
        setTokenFromBody.apply({}, arguments);
    },
    user () {
        setUserFromToken.apply({}, arguments);
    },
    password () {
        checkUserPassword.apply({}, arguments);
    },
    checkLogin () {
        setTokenFromBody.apply({}, arguments);
        setUserFromToken.apply({}, arguments);
        checkUserPassword.apply({}, arguments);
    },
    fields (neededFields) {
        return (function (req, res, next) {
            checkFields(req.body, neededFields, (fields) => {
                req.fields = fields;
                next();
            }, (key) => res.status(401).send('Missing key \'' + key + '\' in body'));
        });
    }
};
