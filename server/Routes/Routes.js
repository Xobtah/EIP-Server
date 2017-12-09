/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let PrototypeRoutes = require('./PrototypeRoutes');
let UserAuthRoutes = require('./UserAuthRoutes');

let Routes = [
    {
        method: 'get',
        route: '/',
        callback (req, res) {
            console.log('User gets the root');
            res.sendStatus(200);
        }
    }, {
        method: 'get',
        route: '/hardware',
        callback (req, res) { res.sendStatus(200); }
    }
];

module.exports = function (Server) {
    return (Routes.concat(new PrototypeRoutes(Server)).concat(new UserAuthRoutes(Server)));
};
