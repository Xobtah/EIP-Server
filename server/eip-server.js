/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let SportsFun = require('./../lib/SportsFun');
let Config = require('./Config/Config.js');
let Server = new SportsFun.Server(Config);

let JWT = require('jsonwebtoken');

/*JWT.sign({ foo: 'bar' }, Server.app.get('secret'), (err, token) => {
    JWT.verify(token, Server.app.get('secret'), (err, decoded) => {
        console.log(decoded);
    });
});*/

Server.Init((DataBase) => {
    console.log('Server started!');
    let routes = require('./Routes/Routes');
    routes = new routes(Server);

    /*
    **  Routes
    */

    // Binding routes that doesn't need authentification
    routes.forEach((route) => {
        if (!route.auth)
            Server.Route.apply(Server, [ route.method, route.route, route.callback ]);
    });
    // Middleware that handles authentification
    Server.app.use(function (req, res, next) {
        if (req.body.token) {
            JWT.verify(req.body.token, this.app.get('secret'), (err, decoded) => {
                if (err)
                    return (res.status(500).send('Failed to authenticate token'));
                req.token = decoded;
                next();
            });
        }
        else
            return (res.status(403).send('No token provided'));
    }.bind(Server));
    // Binding routes that needs authentification
    routes.forEach((route) => {
        if (route.auth)
            Server.Route.apply(Server, [ route.method, route.route, route.callback ]);
    });

    /*
    **  Websocket
    */

    Server.Websocket.Channel('command')
        .On('link', (data) => console.log('New link: ' + data.link_id));

    Server.Websocket.Channel('command').Emit('start_session').Emit('end_session').Emit('link');

    Server.Websocket.On('connection', (socket) => {
        console.log('Socket connection from ' + socket.request.connection.remoteAddress);
        socket.emit('hi', 'Hey, it works!');
    });
});
