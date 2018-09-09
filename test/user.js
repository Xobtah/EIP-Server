/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../eip-server');
let should = chai.should();

let mongoose = require('mongoose');
let User = mongoose.model('User');

let userToken = null;

chai.use(chaiHttp);
//Our parent block
describe('User', () => {
    /*
    ** Test the /GET route
    */
    describe('GET /user', () => {
	it('should fail as user is not connected yet', (done) => {
	    chai.request(server)
	        .get('/api/user')
	        .end((err, res) => {
		    res.should.have.status(403);
		    done();
		});
	});
    });

    let goodUser = {
	username: 'Chellyabinsk',
	email: 'test@subject.ts',
	firstName: 'Chell',
	lastName: 'Johnson',
	birthDate: 'Sun Sep 09 2018 14:12:14 GMT+0200',
	password: 'ts2018lol',
	bio: 'I\'m a horrible person, it has been proven by science.'
    };

    let badUser = {
	bio: 'I may miss a lot of info lol'
    };

    describe('Register user', () => {
	before((done) => {
	    User.find({ username: goodUser.username }).remove(() => done());
	});

	it('should fail, missing info', (done) => {
	    chai.request(server)
		.post('/api/user')
		.send(badUser)
		.end((err, res) => {
		    res.should.have.status(403);
		    res.body.should.be.an('object');
		    res.body.should.have.a.property('message').equal("Missing key 'birthDate' in body");
		    done();
		});
	});

	it('should succeed creating user', (done) => {
	    chai.request(server)
		.post('/api/user')
		.send(goodUser)
		.end((err, res) => {
		    res.should.have.status(200);
		    res.body.should.be.an('object');
		    res.body.should.have.a.property('success').equal(true);
		    res.body.should.have.a.property('message').equal('User ' + goodUser.firstName + ' ' + goodUser.lastName + ' has been inserted');
		    done();
		});
	});
    });

    describe('Login', () => {
	it('should forbid the access, bad password', (done) => {
	    chai.request(server)
		.post('/api/user/login')
		.send({ username: goodUser.username, password: goodUser.password.split('').reverse().join('') })
		.end((err, res) => {
		    res.should.have.status(403);
		    res.should.be.an('object');
		    res.body.should.have.a.property('message').equal('Access forbidden');
		    done();
		});
	});

	it('should forbid the access, bad username', (done) => {
	    chai.request(server)
		.post('/api/user/login')
		.send({ username: goodUser.username.split('').reverse().join(''), password: goodUser.password })
		.end((err, res) => {
		    res.should.have.status(403);
		    res.should.be.an('object');
		    res.body.should.have.a.property('message').equal('Access forbidden');
		    done();
		});
	});

	it('should grant access, and we get token', (done) => {
	    chai.request(server)
		.post('/api/user/login')
		.send({ username: goodUser.username, password: goodUser.password })
		.end((err, res) => {
		    res.should.have.status(200);
		    res.should.be.an('object');
		    res.body.should.have.a.property('message').equal('Logged in');
		    res.body.should.have.a.property('data').to.be.an('object').to.have.a.property('token');
		    userToken = res.body.data.token;
		    done();
		});
	});

	it('should not change password, bad old password', (done) => {
	    chai.request(server)
		.put('/api/user/password')
		.set('token', userToken)
		.send({ password: goodUser.password.split('').reverse().join(''),
			newPassword: goodUser.password.split('').reverse().join('') })
		.end((err, res) => {
		    res.should.have.status(403);
		    res.should.be.an('object');
		    res.body.should.have.a.property('message').equal('Incorrect password');
		    done();
		});
	});

	it('should not change password, missing field newPassword', (done) => {
	    chai.request(server)
		.put('/api/user/password')
		.set('token', userToken)
		.send({ password: goodUser })
		.end((err, res) => {
		    res.should.have.status(403);
		    res.should.be.an('object');
		    res.body.should.have.a.property('message').equal("Missing key 'newPassword' in body");
		    done();
		});
	});

	it('should change password', (done) => {
	    chai.request(server)
		.put('/api/user/password')
		.set('token', userToken)
		.send({ password: goodUser.password,
		      newPassword: goodUser.password.split('').reverse().join('') })
		.end((err, res) => {
		    res.should.have.status(200);
		    res.should.be.an('object');
		    res.body.should.have.a.property('message').equal("User " + goodUser.firstName + ' ' + goodUser.lastName + "'s password has been updated");
		    goodUser.password = goodUser.password.split('').reverse().join('');
		    done();
		});
	});

	it('should not delete the user, bad token', (done) => {
	    chai.request(server)
		.delete('/api/user')
		.set('token', userToken.split('').reverse().join(''))
		.send({ password: goodUser.password })
		.end((err, res) => {
		    res.should.have.status(500);
		    res.should.be.an('object');
		    res.body.should.have.a.property('message').equal('Failed to authenticate token');
		    done();
		});
	});

	it('should not delete the user, bad password', (done) => {
	    chai.request(server)
		.delete('/api/user')
		.set('token', userToken)
		.send({ password: goodUser.password.split('').reverse().join('') })
		.end((err, res) => {
		    res.should.have.status(403);
		    res.should.be.an('object');
		    res.body.should.have.a.property('message').equal('Incorrect password');
		    done();
		});
	});

	it('should delete the current user', (done) => {
	    chai.request(server)
		.delete('/api/user')
		.set('token', userToken)
		.send({ password: goodUser.password })
		.end((err, res) => {
		    res.should.have.status(200);
		    res.should.be.an('object');
		    res.body.should.have.a.property('message').equal('User ' + goodUser.firstName + ' ' + goodUser.lastName + ' has been deleted');
		    done();
		});
	});
    });

});
