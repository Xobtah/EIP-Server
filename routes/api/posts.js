/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let Post = require('mongoose').model('Post');
let mid = require('./../middlewares');

/**
* @api {GET} /api/post Get user's post feed
* @apiName GetPostFeed
* @apiGroup Post
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data Object containing the post list.
*/

router.get('/', mid.checkUser, (req, res) => {
    let postListAuthorId = req.user.links;
    postListAuthorId.push(req.user._id);
    Post.find({ author: { $in: postListAuthorId } }).then((data) => {
        res.status(200).send({ success: true, message: 'OK', data: data });
    }).catch((err) => res.status(500).send({ success: false, message: err }));
});

/**
* @api {GET} /api/post/:id Get post by id
* @apiName GetPost
* @apiGroup Post
*
* @apiParam {Number} id Post's ID.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data Object containing the post.
*
* @apiError PostNotFound The post was not found.
*/

router.get('/:id', (req, res) => {
    Post.findById(req.params.id, (err, post) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send(post);
    });
});

/**
* @api {POST} /api/post Post a new post
* @apiName PostPost
* @apiGroup Post
*
* @apiParam {String} content Post's content.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError FieldMissing One field is missing (probably 'content').
*/

router.post('/', mid.token, mid.fields([ 'content' ]), (req, res) => {
    let post = new Post();
    post.content = req.fields.content;
    post.author = req.token._id;
    post.save((err) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        res.status(200).send({ success: true, message: 'Post has been inserted' });
    });
});

/**
* @api {DELETE} /api/post/:id Delete post by id
* @apiName DeletePost
* @apiGroup Post
*
* @apiParam {Number} id The ID of the post to delete.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError PostNotFound The post was not found.
* @apiError NoPathParamProvided Path param id wasn't provided.
*/

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

/**
* @api {PUT} /api/post/like/:id Like a post
* @apiName LikePost
* @apiGroup Post
*
* @apiParam {Number} id The ID of the post.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
*
* @apiError PostNotFound The post was not found.
* @apiError NoPathParamProvided Path param id wasn't provided.
*/

router.put('/like/:id', mid.checkUser, (req, res) => {
    Post.findById(req.params.id, (err, post) => {
        if (err)
            return (res.status(500).send({ success: false, message: err }));
        post.likes.push(req.user._id);
        post.save((err) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'Post has been liked' });
        });
    });
});

module.exports = router;
