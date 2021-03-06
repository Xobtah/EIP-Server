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
                next({ success: false, status: 500, message: 'Failed to authenticate token' });
            req.token = decoded;
            next();
        });
    }
    else
        next({ success: false, status: 403, message: 'No token provided' });
}

function setUserFromToken(req, res, next) {
    if (!req.token)
        next({ success: false, status: 500, message: 'Token not set' });
    User.findById(req.token._id, (err, user) => {
        if (err)
            next({ success: false, status: 500, message: err });
        req.user = user;
        next();
    });
}

function checkUserPassword(req, res, next) {
    if (!req.user)
        next({ success: false, status: 500, message: 'User variable not set' });
    if (!req.body.password)
        next({ success: false, status: 401, message: 'Missing key \'password\' in body' });
    req.user.tryPassword(req.body.password).then((samePassword) => {
        if (!samePassword)
            next({ success: false, status: 403, message: 'Incorrect password' });
        next();
    });
}

function checkAllRoles(user, roles, next) {
    if (!user)
        next({ success: false, status: 500, message: 'User variable not set' });
    if (!user.roles || !user.roles.length)
        next({ success: false, status: 403, message: 'User has no roles' });
    if (!roles.every((role) => { return (user.roles.indexOf(role) >= 0); }))
        next({ success: false, status: 403, message: 'User not allowed' });
    else
        next();
}

function checkOneRole(user, roles, next) {
    let isOk = false;

    if (!user)
        next({ success: false, status: 500, message: 'User variable not set' });
    if (!user.roles || !user.roles.length)
        next({ success: false, status: 403, message: 'User has no roles' });
    roles.forEach((role) => { if (user.roles.indexOf(role) >= 0) isOk = true; });
    if (!isOk)
        next({ success: false, status: 403, message: 'User not allowed' });
    else
        next();
}

function checkFields(body, fields, success, error) {
    let object = {};
    let ключ = null;

    fields.forEach((key) => {
        if (body[key])
            object[key] = body[key];
        else
            ключ = key;
    });
    if (error && ключ)
        error(ключ);
    else
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
    allRoles (roles) {
        return ([ setTokenFromBody, setUserFromToken, function (req, res, next) {
            checkAllRoles(req.user, roles, next);
        } ]);
    },
    oneRole (roles) {
        return ([ setTokenFromBody, setUserFromToken, function (req, res, next) {
            checkOneRole(req.user, roles, next);
        } ]);
    },
    fields (neededFields) {
        return (function (req, res, next) {
            checkFields(req.body, neededFields, (fields) => {
                if (!req.fields)
                    req.fields = {};
                for (key in fields)
                    req.fields[key] = fields[key];
                next();
            }, (key) => next({ success: false, status: 403, message: 'Missing key \'' + key + '\' in body' }));
        });
    },
    optionalFields (optFields) {
        return (function (req, res, next) {
            checkFields(req.body, optFields, (fields) => {
                if (!req.fields)
                    req.fields = {};
                for (key in fields)
                    req.fields[key] = fields[key];
                next();
            });
        });
    },
    fieldsFromModel (model) {
        let requiredFields = [];
        let optionalFields = [];

        for (key in model.schema.paths)
            (model.schema.paths[key].isRequired ? requiredFields : optionalFields).push(model.schema.paths[key].path);
        return (function (req, res, next) {
            checkFields(req.body, requiredFields, (fields) => {
                if (!req.fields)
                    req.fields = {};
                for (key in fields)
                    req.fields[key] = fields[key];
                checkFields(req.body, optionalFields, (fields) => {
                    if (!req.fields)
                        req.fields = {};
                    for (key in fields)
                        req.fields[key] = fields[key];
                    next();
                });
            }, (key) => next({ success: false, status: 403, message: 'Missing key \'' + key + '\' in body' }));
        });
    },
    fieldsFromModelAllOptional (model) {
        let картошка = [];

        for (key in model.schema.paths)
            картошка.push(model.schema.paths[key].path);
        return (function (req, res, next) {
            checkFields(req.body, картошка, (fields) => {
                if (!req.fields)
                    req.fields = {};
                for (key in fields)
                    req.fields[key] = fields[key];
                next();
            });
        });
    }
};
