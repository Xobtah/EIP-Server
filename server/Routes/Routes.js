/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let PrototypeRoutes = require('./PrototypeRoutes');
let UserAuthRoutes = require('./UserAuthRoutes');
let UnidentifiedRoutes = require('./UnidentifiedRoutes');

let routes = [
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
    let unidentifiedRoutes = new UnidentifiedRoutes(Server);
    let identifiedRoutes = routes.concat(new PrototypeRoutes(Server)).concat(new UserAuthRoutes(Server));

    unidentifiedRoutes.forEach((route) => route.auth = false);
    identifiedRoutes.forEach((route) => route.auth = true);
    return (identifiedRoutes.concat(unidentifiedRoutes));
};
