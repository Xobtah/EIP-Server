/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

// Create user

let badUserMissingInfo = {
	bio: 'I may miss a lot of info lol'
};
let badUserMarty = {
    username: 'Chellyabinsk',
    email: 'test@subject.ts',
    firstName: 'Chell',
    lastName: 'Johnson',
    birthDate: 'Sun Sep 09 2918 14:12:14 GMT+0200',
    password: 'ts2018lol',
    bio: 'I\'m a horrible person, it has been proven by science.'
};
let badUserTooYoung = {
    username: 'Chellyabinsk',
    email: 'test@subject.ts',
    firstName: 'Chell',
    lastName: 'Johnson',
    birthDate: 'Sun Sep 09 2018 14:12:14 GMT+0200',
    password: 'ts2018lol',
    bio: 'I\'m a horrible person, it has been proven by science.'
};
let badUserShortUsername = {
    username: 'Ch',
    email: 'test@subject.ts',
    firstName: 'Chell',
    lastName: 'Johnson',
    birthDate: 'Sun Sep 09 2000 14:12:14 GMT+0200',
    password: 'ts2018lol',
    bio: 'I\'m a horrible person, it has been proven by science.'
};

describe('Register user', () => {
	before((done) => {
		User.find({ email: { $in: [goodUser.email, goodUser2.email] } }).remove(() => done());
	});

	it('should fail, missing info', (done) => {
		chai.request(server)
			.post('/api/user')
			.send(badUserMissingInfo)
			.end((err, res) => {
				res.should.have.status(403);
				res.body.should.be.an('object');
				res.body.should.have.a.property('message').equal("Missing key 'birthDate' in body");
				done();
			});
	});

	it('should fail, birth date in the future', (done) => {
		chai.request(server)
			.post('/api/user')
			.send(badUserMarty)
			.end((err, res) => {
				res.should.have.status(403);
				res.body.should.be.an('object');
				res.body.should.have.a.property('message').equal('You can\'t be born in the future, Marty!');
				done();
			});
	});

	it('should fail, less than 13 yo', (done) => {
		chai.request(server)
			.post('/api/user')
			.send(badUserTooYoung)
			.end((err, res) => {
				res.should.have.status(403);
				res.body.should.be.an('object');
				res.body.should.have.a.property('message').equal('You must be thirteen to use SportsFun');
				done();
			});
	});

	it('should fail, username too short', (done) => {
		chai.request(server)
			.post('/api/user')
			.send(badUserShortUsername)
			.end((err, res) => {
				res.should.have.status(403);
				res.body.should.be.an('object');
				res.body.should.have.a.property('message').equal('The username must be at least three characters long');
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

	it('should succeed creating another user', (done) => {
		chai.request(server)
			.post('/api/user')
			.send(goodUser2)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.an('object');
				res.body.should.have.a.property('success').equal(true);
				res.body.should.have.a.property('message').equal('User ' + goodUser2.firstName + ' ' + goodUser2.lastName + ' has been inserted');
				done();
			});
	});
});
