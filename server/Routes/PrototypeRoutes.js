/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

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

module.exports = function (Server) {
    return ([
        {
            method: 'get',
            route: '/api/users',
            callback (req, res) { findInCollection('Users', req, res) }
        }, {
            method: 'get',
            route: '/api/posts',
            callback (req, res) { findInCollection('Posts', req, res) }
        }, {
            method: 'get',
            route: '/api/activities',
            callback (req, res) { findInCollection('Activities', req, res) }
        },

        {
            method: 'post',
            route: '/api/users',
            callback (req, res) { postInCollection('Users', req, res) }
        }, {
            method: 'post',
            route: '/api/posts',
            callback (req, res) { postInCollection('Posts', req, res) }
        }, {
            method: 'post',
            route: '/api/activities',
            callback (req, res) { postInCollection('Activities', req, res) }
        },

        {
            method: 'delete',
            route: '/api/users',
            callback (req, res) { deleteInCollection('Users', req, res) }
        }, {
            method: 'delete',
            route: '/api/posts',
            callback (req, res) { deleteInCollection('Posts', req, res) }
        }, {
            method: 'delete',
            route: '/api/activities',
            callback (req, res) { deleteInCollection('Activities', req, res) }
        }
    ]);
};
