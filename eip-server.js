/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

let SportsFun = require('./server/SportsFun');
let Server = new SportsFun.Server();

Server.Init((DataBase) => {
    console.log('Server started!');

    Server.Route('get', '/', (req, res) => {
        console.log('User gets the root');
        res.sendStatus(200);
    });

    Server.Route('post', '/hardware', (req, res) => {
	res.sendStatus(200);
    });

    Server.Route('get', '/api/users', (req, res) => {
	DataBase.Users.Find().toArray((err, result) => {
	    res.header("Access-Control-Allow-Origin", "*");
	    res.header("Access-Control-Allow-Headers", "X-Requested-With");
	    if (err)
		res.sendStatus(500);
	    else
		res.send(result);
	});
    });

    Server.Route('get', '/api/posts', (req, res) => {
	DataBase.Posts.Find().toArray((err, result) => {
	    res.header("Access-Control-Allow-Origin", "*");
	    res.header("Access-Control-Allow-Headers", "X-Requested-With");
	    if (err)
		res.sendStatus(500);
	    else
		res.send(result);
	});
    });

    Server.Route('get', '/api/activities', (req, res) => {
	DataBase.Activities.Find().toArray((err, result) => {
	    res.header("Access-Control-Allow-Origin", "*");
	    res.header("Access-Control-Allow-Headers", "X-Requested-With");
	    if (err)
		res.sendStatus(500);
	    else
		res.send(result);
	});
    });
});
