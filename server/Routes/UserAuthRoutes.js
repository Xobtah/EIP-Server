/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let JWT = require('jsonwebtoken');

let checkFields = function (body, fields, success, error) {
    let operationSuccess = false;

    operationSuccess = Object.keys(fields).every((key) => {
        if (!body[key]) {
            error(key);
            return (false);
        }
        fields[key] = body[key];
        return (true);
    });
    if (operationSuccess)
        success(fields);
};

module.exports = function (Server) {
    /*JWT.sign({ foo: 'bar' }, Server.app.get('secret'), (err, token) => {
        JWT.verify(token, Server.app.get('secret'), (err, decoded) => {
            console.log(decoded);
        });
    });*/
    return ([
        {
            method: 'post',
            route: '/api/user/edit/password',
            callback (req, res) {
                checkFields(req.body, { oldPassword: null, newPassword: null, token: null }, (fields) => {
                    JWT.verify(fields.token, Server.app.get('secret'), (err, decoded) => {
                        Server.DataBase.Users.UpdateOne({ _id: new Server.DataBase.ObjectID(decoded._id), password: fields.oldPassword }, { $set: { password: fields.newPassword } }, (err, result) => {
                            if (err || !result.result.nModified)
                                return (res.status(500).send(err || 'User not found'));
                            res.status(200).send('Password updated');
                        });
                    });
                }, (key) => res.status(401).send('Missing key \'' + key + '\' in body'));
            }
        }, {
            method: 'post',
            route: '/api/user/edit/email',
            callback (req, res) {
                checkFields(req.body, { oldEmail: null, newEmail: null, password: null, token: null }, (fields) => {
                    JWT.verify(fields.token, Server.app.get('secret'), (err, decoded) => {
                        Server.DataBase.Users.UpdateOne({ _id: new Server.DataBase.ObjectID(decoded._id), password: fields.password, email: fields.oldEmail }, { $set: { email: fields.newEmail } }, (err, result) => {
                            if (err || !result.result.nModified)
                                return (res.status(500).send(err || 'User not found'));
                            res.status(200).send('Email updated');
                        });
                    });
                }, (key) => res.status(401).send('Missing key \'' + key + '\' in body'));
            }
        }, {
            method: 'post',
            route: '/api/user/register',
            callback (req, res) {
                checkFields(req.body, {
                    userName: null,
                    email: null,
                    firstName: null,
                    lastName: null,
                    birthDate: null,
                    password: null
                }, (fields) => {
                    fields.friends = [];
                    Server.DataBase.Users.Insert(fields, (err, result) => {
                        if (err || !result)
                            return (res.status(500).send('Insert error'));
                        res.status(200).send('User ' + fields.firstName + ' ' + fields.lastName + ' inserted');
                    });
                }, (key) => res.status(401).send('Missing key \'' + key + '\' in body'));
            }
        }, {
            method: 'post',
            route: '/api/user/login',
            callback (req, res) {
                checkFields(req.body, { userName: null, password: null }, (fields) => {
                    Server.DataBase.Users.FindOne(fields, (err, result) => {
                        if (err || !result)
                            return (res.status(401).send('User not found'));
                        JWT.sign({ _id: result._id }, Server.app.get('secret'), (err, token) => {
                            if (err)
                                return (res.status(500).send('Failed to generate token'));
                            res.json({
                                success: true,
                                message: 'Success',
                                token: token
                            });
                        });
                    });
                }, (key) => res.status(401).send('Missing key \'' + key + '\' in body'));
            }
        }, {
            method: 'get',
            route: '/api/user/lostpassword',
            callback (req, res) {
                res.sendStatus(200);
            }
        }
    ]);
};
