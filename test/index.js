/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
global.chai = require('chai');
global.chaiHttp = require('chai-http');
global.server = require('../eip-server');
global.should = chai.should();

global.mongoose = require('mongoose');
global.User = mongoose.model('User');

// Variables
global.userToken = null;
global.postId = null;
global.commentId = null;
global.goodUser = {
    username: 'Chellyabinsk',
    email: 'test@subject.ts',
    firstName: 'Chell',
    lastName: 'Johnson',
    birthDate: 'Sun Sep 09 2018 14:12:14 GMT+0200',
    password: 'ts2018lol',
    bio: 'I\'m a horrible person, it has been proven by science.'
};
global.badUser = {
    bio: 'I may miss a lot of info lol'
};

chai.use(chaiHttp);

// Create user
require('./create_user');

// Log user
require('./log_user');

// Update user info
require('./update_user');

// Create post
require('./create_post');

// Update post
require('./update_post');

// Delete post
require('./delete_post');

// Delete user
require('./delete_user');
