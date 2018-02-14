/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let JWT = require('jsonwebtoken');
let User = require('mongoose').model('User');
let config = require('./../config');

function setTokenFromBody(req, res, next) {
    if (req.headers.token) {
        JWT.verify(req.headers.token, config.secret || 'secret', (err, decoded) => {
            if (err)
                next(new Error({ success: false, status: 500, message: 'Failed to authenticate token' }));
            req.token = decoded;
            next();
        });
    }
    else
        next(new Error({ success: false, status: 403, message: 'No token provided' }));
}

function setUserFromToken(req, res, next) {
    if (!req.token)
        next(new Error({ success: false, status: 500, message: 'Token not set' }));
    User.findById(req.token._id, (err, user) => {
        if (err)
            next(new Error({ success: false, status: 500, message: err }));
        req.user = user;
        next();
    });
}

function checkUserPassword(req, res, next) {
    if (!req.user)
        next(new Error({ success: false, status: 500, message: 'User variable not set' }));
    if (!req.body.password)
        next(new Error({ success: false, status: 401, message: 'Missing key \'password\' in body' }));
    req.user.tryPassword(req.body.password).then((samePassword) => {
        if (!samePassword)
            next(new Error({ success: false, status: 403, message: 'Incorrect password' }));
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
    token: setTokenFromBody,
    user: setUserFromToken,
    password: checkUserPassword,
    checkLogin: [
        setTokenFromBody,
        setUserFromToken,
        checkUserPassword
    ],
    checkUser: [
        setTokenFromBody,
        setUserFromToken
    ],
    fields (neededFields) {
        return (function (req, res, next) {
            checkFields(req.body, neededFields, (fields) => {
                req.fields = fields;
                next();
            }, (key) => next(new Error({ success: false, status: 403, message: 'Missing key \'' + key + '\' in body' })));
        });
    }
};
