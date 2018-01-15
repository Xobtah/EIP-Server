/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let JWT = require('jsonwebtoken');
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
            route: '/api/user/register',
            callback (req, res) {
                checkFields(req.body, [ 'userName', 'email', 'firstName', 'lastName', 'birthDate', 'password' ], (fields) => {
                    fields.friends = [];
                    // Checking if another user has this username
                    Server.DataBase.Users.FindOne({ userName: fields.userName }, (err, result) => {
                        if (result)
                            return (res.status(401).send('A user with username \'' + fields.userName + '\' already exists'));
                        // Password encryption
                        bcrypt.hash(fields.password, saltRounds, (err, hash) => {
                            if (err)
                                return (res.status(500).send('Failed to hash password'));
                            fields.password = hash;
                            // User insertion
                            Server.DataBase.Users.Insert(fields, (err, result) => {
                                if (err || !result)
                                    return (res.status(500).send('Insert error'));
                                res.status(200).send('User ' + fields.firstName + ' ' + fields.lastName + ' inserted');
                            });
                        });
                    });
                }, (key) => res.status(401).send('Missing key \'' + key + '\' in body'));
            }
        }, {
            method: 'post',
            route: '/api/user/login',
            callback (req, res) {
                checkFields(req.body, [ 'userName', 'password' ], (fields) => {
                    // Getting user by username
                    Server.DataBase.Users.FindOne({ userName: fields.userName }, (err, result) => {
                        if (err || !result)
                            return (res.status(401).send('User does not exist'));
                        // Comparing password with hash
                        bcrypt.compare(fields.password, result.password, (err, sameHash) => {
                            if (err)
                                return (res.status(500).send('Failed to compare hashes'));
                            if (!sameHash)
                                return (res.status(401).send('Bad password'));
                            else
                                JWT.sign({ _id: result._id }, Server.app.get('secret'), (err, token) => {
                                    if (err)
                                        return (res.status(500).send('Failed to generate token'));
                                    res.json({
                                        message: 'Successfully logged in',
                                        token: token
                                    });
                                });
                        });
                    });
                }, (key) => res.status(401).send('Missing key \'' + key + '\' in body'));
            }
        }
    ]);
};
