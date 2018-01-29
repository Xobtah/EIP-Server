/*
** @author: Sylvain Garant
** @website: https://github.com/Xobtah
*/

var Utils = require('./../../lib/Utils');

module.exports = function (Server) {
    return ([
        {
            method: 'post',
            route: '/api/user/wall',
            callback (req, res) {
                // Type, Author, CreationDate, Parent, Likes, Content
                Utils.checkFields(req.body, [ 'content', 'parent' ], (fields) => {
                    fields.type = null;
                    fields.author = req.token._id;
                    fields.creationDate = new Date();
                    fields.likes = [];
                    if (!fields.parent.length)
                        fields.parent = null;
                    Server.DataBase.Posts.Insert(fields, (err, result) => {
                        if (err || !result)
                            return (res.status(500).send('Insert error'));
                        res.status(200).send('Post inserted');
                    });
                }, (key) => res.status(401).send('Missing key \'' + key + '\' in body'));
            }
        },
        {
            method: 'post',
            route: '/api/user/wall/:from/:to',
            callback (req, res) {
                Server.DataBase.Posts.Find({ author: req.token._id }).toArray((err, result) => {
                    if (err)
                        return (res.status(500).send('Oops, it\'s broken!'));
                    res.send(result);
                });
            }
        }
    ]);
}
