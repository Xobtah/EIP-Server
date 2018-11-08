/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

// Delete user

describe('Delete the user', () => {
	it('should not delete the user, bad token', (done) => {
		chai.request(server)
			.delete('/api/user')
			.set('token', userToken.split('').reverse().join(''))
			.send({ password: goodUser.password })
			.end((err, res) => {
				//res.should.have.status(500);
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
				//res.should.have.status(403);
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

	it('should delete the other user', (done) => {
		chai.request(server)
			.delete('/api/user')
			.set('token', userToken2)
			.send({ password: goodUser2.password })
			.end((err, res) => {
				res.should.have.status(200);
				res.should.be.an('object');
				res.body.should.have.a.property('message').equal('User ' + goodUser2.firstName + ' ' + goodUser2.lastName + ' has been deleted');
				done();
			});
	});
});
