/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let JWT = require('jsonwebtoken');

module.exports = function (Server) {
    JWT.sign({ foo: 'bar' }, Server.app.get('secret'), (err, token) => {
        JWT.verify(token, Server.app.get('secret'), (err, decoded) => {
            console.log(decoded);
        });
    });
    return ([
        {
            method: 'post',
            route: '/api/user/edit/password',
            callback (req, res) {
                res.sendStatus(200);
            }
        }, {
            method: 'post',
            route: '/api/user/edit/email',
            callback (req, res) {
                res.sendStatus(200);
            }
        }, {
            method: 'post',
            route: '/api/user/register',
            callback (req, res) {
                res.sendStatus(200);
            }
        }, {
            method: 'post',
            route: '/api/user/login',
            callback (req, res) {
                res.sendStatus(200);
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
