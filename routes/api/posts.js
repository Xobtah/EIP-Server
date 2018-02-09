/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let Post = require('mongoose').model('Post');
let mid = require('./../middlewares');

router.get('/:id', (req, res) => {
    Post.findById(req.params.id, (err, post) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send(post);
    });
});

router.post('/', mid.token, mid.fields([ 'content' ]), (req, res) => {
    let post = new Post();
    post.content = req.fields.content;
    post.creationDate = new Date();
    post.author = req.token._id;
    post.save((err) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'Post has been inserted' });
    });
});

router.delete('/:id', (req, res) => {
    Post.findById(req.params.id, (err, post) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        post.remove((err) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'Post has been deleted' });
        });
    });
});

module.exports = router;
