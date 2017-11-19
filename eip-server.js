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

    function findInCollection(collection, req, res) {
        DataBase[collection].Find().toArray((err, result) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
    	    if (err)
    		      res.sendStatus(500);
    	    else
    		      res.send(result);
    	});
    }

    function postInCollection(collection, req, res) {
        if (req.body)
        	DataBase[collection].Insert(req.body);
        res.sendStatus(200);
    }

    Server.Route('get', '/api/users', (req, res) => findInCollection('Users', req, res));
    Server.Route('get', '/api/posts', (req, res) => findInCollection('Posts', req, res));
    Server.Route('get', '/api/activities', (req, res) => findInCollection('Activities', req, res));

    Server.Route('post', '/api/posts', (req, res) => postInCollection('Posts', req, res));
    Server.Route('post', '/api/users', (req, res) => postInCollection('Users', req, res));
});
