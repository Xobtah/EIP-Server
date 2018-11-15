/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

// Log user

describe('Login', () => {
	it('should forbid the access, bad password', (done) => {
		chai.request(server)
			.post('/api/user/login')
			.send({ username: goodUser.username, password: goodUser.password.split('').reverse().join('') })
			.end((err, res) => {
				res.should.have.status(403);
				res.should.be.an('object');
				res.body.should.have.a.property('message').equal('Username/password combination doesn\'t match any user');
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
				res.body.should.have.a.property('message').equal('Username/password combination doesn\'t match any user');
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

	it('should grant access to the second user', (done) => {
		chai.request(server)
			.post('/api/user/login')
			.send({ username: goodUser2.username, password: goodUser2.password })
			.end((err, res) => {
				res.should.have.status(200);
				res.should.be.an('object');
				res.body.should.have.a.property('message').equal('Logged in');
				res.body.should.have.a.property('data').to.be.an('object').to.have.a.property('token');
				userToken2 = res.body.data.token;
				done();
			});
	});
});
