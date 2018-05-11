/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

let router = require('express').Router();
let Post = require('mongoose').model('Post');
let User = require('mongoose').model('User');
let mid = require('./../middlewares');
let _ = require('lodash');
let async = require('async');

let postAuthorData = {
    firstName: true,
    lastName: true,
    profilePic: true
};

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
    Post.find({ author: { $in: _.union(req.user.links, [ req.user._id ]) }, parent: null }).lean().then((data) => {
        let func = [];
        data.forEach((post) => {
            func.push(function (callback) {
                Post.find({ parent: post._id }, { _id: true }).then((idArray) => {
                    post.comments = _.map(idArray, '_id');
                    User.findOne({ _id: post.author }, postAuthorData).then((user) => {
                        if (user)
                            post.author = user;
                        callback();
                    }).catch(callback);
                }).catch(callback);
            });
        });
        async.parallel(func, (err) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'OK', data });
        });
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
    Post.findById(req.params.id).lean().then((post) => {
        Post.find({ parent: post._id }, { _id: true }).then((idArray) => {
            post.comments = _.map(idArray, '_id');
            User.findOne({ _id: post.author }, postAuthorData).then((user) => {
                if (user)
                    post.author = user;
                res.status(200).send({ success: true, message: 'OK', data: post });
            });
        });
    }).catch((err) => res.status(500).send({ success: false, message: err }));
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

router.post('/', mid.token, mid.fields([ 'content' ]), mid.optionalFields([ 'parent' ]), (req, res) => {
    let post = new Post();
    post.content = req.fields.content;
    post.parent = req.fields.parent;
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
* @api {PUT} /api/post/like/:id Like/Unlike a post
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
        if (post.likes.indexOf(req.user._id) < 0)
            post.likes.push(req.user._id);
        else
            post.likes.splice(post.likes.indexOf(req.user._id));
        post.save((err) => {
            if (err)
                return (res.status(500).send({ success: false, message: err }));
            res.status(200).send({ success: true, message: 'OK' });
        });
    });
});

/**
* @api {GET} /api/post/comments/:id Get all the comments of a given post
* @apiName PostComments
* @apiGroup Post
*
* @apiParam {Number} id The ID of the post.
*
* @apiSuccess {Boolean} success True
* @apiSuccess {String} message Success message.
* @apiSuccess {Object} data Array containing the comments.
*
* @apiError PostNotFound The post was not found.
* @apiError NoPathParamProvided Path param id wasn't provided.
*/

router.get('/comments/:id', (req, res) => {
    if (!req.params.id)
        return (res.status(400).send({ success: false, message: 'Missing path param id' }));
    Post.find({ parent: req.params.id }).lean().then((posts) => {
        // let func = [];
        // posts.forEach((post) => {
        //     func.push(function (callback) {
        //         User.findById(post.author).then((user) => {
        //             if (user)
        //                 post.author = user;
        //             callback();
        //         }).catch(callback);
        //     });
        // });
        // async.parallel(func, (err) => {
        //     if (err)
        //         return (res.status(500).send({ success: false, message: err }));
        //     res.status(200).send({ success: true, message: 'OK', data: posts });
        // });
        posts.forEach((post) => {
            User.findById(post.author).then((user) => {
                if (user)
                    post.author = user;
            });
        });
        res.status(200).send({ success: true, message: 'OK', data: posts });
    }).catch((err) => res.status(500).send({ success: false, message: err }));
});

module.exports = router;
