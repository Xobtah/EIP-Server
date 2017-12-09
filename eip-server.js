/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let SportsFun = require('./lib/SportsFun');
let Config = require('./server/Config/Config.js');
let Server = new SportsFun.Server(Config);

Server.Init((DataBase) => {
    console.log('Server started!');
    let Routes = require('./server/Routes/Routes');
    Routes = new Routes(Server);

    Routes.forEach((route) => {
        Server.Route.apply(Server, [ route.method, route.route, route.callback ]);
    });
});

Server.Websocket.NewChannel('command').NewChannel('data').NewChannel('error');

Server.Websocket.Channel('command')
    .On('link', (data) => console.log('New link: ' + data.link_id));

Server.Websocket.Channel('command').Emit('start_session').Emit('end_session').Emit('link');
