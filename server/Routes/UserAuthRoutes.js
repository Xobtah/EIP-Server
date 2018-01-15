/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let bcrypt = require('bcrypt');
let saltRounds = 10;

let checkFields = function (body, fields, success, error) {
    let object = {};
    let operationSuccess = false;

    operationSuccess = fields.every((key) => {
        if (!body[key]) {
            error(key);
            return (false);
        }
        object[key] = body[key];
        return (true);
    });
    if (operationSuccess)
        success(object);
};

module.exports = function (Server) {
    return ([
        {
            method: 'post',
            route: '/api/user/edit/password',
            callback (req, res) {
                checkFields(req.body, [ 'oldPassword', 'newPassword', 'token' ], (fields) => {
                    // Finding user by username
                    Server.DataBase.Users.FindOne({ _id: new Server.DataBase.ObjectID(req.token._id) }, (err, result) => {
                        if (err || !result)
                            return (res.status(500).send('User not found'));
                        // Comparing password with hash
                        bcrypt.compare(fields.oldPassword, result.password, (err, sameHash) => {
                            if (err)
                                return (res.status(500).send('Failed to compare hashes'));
                            if (!sameHash)
                                return (res.status(401).send('Bad password'));
                            else
                                bcrypt.hash(fields.newPassword, saltRounds, (err, hash) => {
                                    if (err)
                                        return (res.status(500).send('Failed to hash password'));
                                    // Updating password
                                    Server.DataBase.Users.UpdateOne({ _id: new Server.DataBase.ObjectID(req.token._id) }, { $set: { password: hash } }, (err, result) => {
                                        if (err || !result.result.nModified)
                                            return (res.status(500).send('Failed to update password'));
                                        res.status(200).send('Password updated');
                                    });
                                });
                        });
                    });
                }, (key) => res.status(401).send('Missing key \'' + key + '\' in body'));
            }
        }, {
            method: 'post',
            route: '/api/user/edit/email',
            callback (req, res) {
                checkFields(req.body, [ 'oldEmail', 'newEmail', 'password', 'token' ], (fields) => {
                    Server.DataBase.Users.UpdateOne({ _id: new Server.DataBase.ObjectID(req.token._id), password: fields.password, email: fields.oldEmail }, { $set: { email: fields.newEmail } }, (err, result) => {
                        if (err || !result.result.nModified)
                            return (res.status(500).send(err || 'User not found'));
                        res.status(200).send('Email updated');
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
