/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
global.chai = require('chai');
chai.use(require('chai-http'));
chai.should();

global.server = require('../eip-server');

global.mongoose = require('mongoose');
global.User = mongoose.model('User');
global.Notification = mongoose.model('Notification');

// Variables
global.userToken = null;
global.userToken2 = null;
global.postId = null;
global.commentId = null;
global.goodUser = {
    username: 'Chellyabinsk',
    email: 'test@subject.ts',
    firstName: 'Chell',
    lastName: 'Johnson',
    birthDate: 'Sun Sep 09 2000 14:12:14 GMT+0200',
    password: 'ts2018lol',
    bio: 'I\'m a horrible person, it has been proven by science.'
};
global.goodUser2 = {
    username: 'Wheatley4ever',
    email: 'wheatley@aperture.science',
    firstName: 'Wheatley',
    lastName: 'Core',
    birthDate: 'Sun Sep 09 2000 14:12:14 GMT+0200',
    password: 'ilovenasa',
    bio: 'Stay still, please!'
};

describe('TESTS', () => {
    // Create user
    require('./create_user');

    // Log user
    require('./log_user');

    // Update user info
    require('./get_user');

    // Update user info
    require('./update_user');

    // Create post
    require('./create_post');

    // Update post
    require('./update_post');

    // Get notification
    require('./get_notif');

    // Delete post
    require('./delete_post');

    // Delete user
    require('./delete_user');
});