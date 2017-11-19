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
        	DataBase[collection].Insert(req.body).then((commandResult) => {
                if (commandResult.result.ok)
                    res.send(commandResult.ops);
                else
                    res.sendStatus(500);
            });
    }

    function deleteInCollectionById(collection, req, res) {
        if (req.body)
            DataBase[collection].Remove(req.body).then((commandResult) => {
                res.send(commandResult.result);
            });
    }

    Server.Route('get', '/api/users', (req, res) => findInCollection('Users', req, res));
    Server.Route('get', '/api/posts', (req, res) => findInCollection('Posts', req, res));
    Server.Route('get', '/api/activities', (req, res) => findInCollection('Activities', req, res));

    Server.Route('post', '/api/posts', (req, res) => postInCollection('Posts', req, res));
    Server.Route('post', '/api/users', (req, res) => postInCollection('Users', req, res));
    Server.Route('post', '/api/activities', (req, res) => postInCollection('Activities', req, res));

    Server.Route('delete', '/api/users', (req, res) => deleteInCollectionById('Users', req, res));
    Server.Route('delete', '/api/posts', (req, res) => deleteInCollectionById('Posts', req, res));
    Server.Route('delete', '/api/activities', (req, res) => deleteInCollectionById('Activities', req, res));
});
