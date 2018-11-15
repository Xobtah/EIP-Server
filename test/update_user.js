/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

// Update user

describe('Update user info', () => {
	it('should not change password, bad old password', (done) => {
		chai.request(server)
			.put('/api/user/password')
			.set('token', userToken)
			.send({
				password: goodUser.password.split('').reverse().join(''),
				newPassword: goodUser.password.split('').reverse().join('')
			})
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

	it('shouldn\'t change password, too short', (done) => {
		chai.request(server)
			.put('/api/user/password')
			.set('token', userToken)
			.send({ password: goodUser.password, newPassword: 'doot' })
			.end((err, res) => {
				res.should.have.status(403);
				res.should.be.an('object');
				res.body.should.have.a.property('message').equal("The username must be at least three characters long");
				done();
			});
	});

	it('should change password', (done) => {
		chai.request(server)
			.put('/api/user/password')
			.set('token', userToken)
			.send({
				password: goodUser.password,
				newPassword: 'isthecakealie'
			})
			.end((err, res) => {
				res.should.have.status(200);
				res.should.be.an('object');
				res.body.should.have.a.property('message').equal("User " + goodUser.firstName + ' ' + goodUser.lastName + "'s password has been updated");
				goodUser.password = 'isthecakealie';
				done();
			});
	});

	it('shouldn\'t change username, too short', (done) => {
		chai.request(server)
			.put('/api/user')
			.set('token', userToken)
			.send({ username: 'do' })
			.end((err, res) => {
				res.should.have.status(403);
				res.should.be.an('object');
				res.body.should.have.a.property('message').equal('The username must be at least three characters long');
				done();
			});
	});

	it('should change username', (done) => {
		chai.request(server)
			.put('/api/user')
			.set('token', userToken)
			.send({ username: goodUser.username + 'aya' })
			.end((err, res) => {
				res.should.have.status(200);
				res.should.be.an('object');
				res.body.should.have.a.property('message').equal('User ' + goodUser.username + 'aya' + ' has been updated');
				goodUser.username += 'aya';
				done();
			});
	});

	it('should follow the other user', (done) => {
		chai.request(server)
			.put('/api/user/link/' + goodUser2._id)
			.set('token', userToken)
			.end((err, res) => {
				res.should.have.status(200);
				res.should.be.an('object');
				res.body.should.have.a.property('message').equal('User ' + goodUser2.firstName + ' ' + goodUser2.lastName + ' has been followed');
				done();
			});
	});

	it('shouldn\'t find a user', (done) => {
		chai.request(server)
			.put('/api/user/link/' + goodUser2._id.split('').reverse().join(''))
			.set('token', userToken)
			.end((err, res) => {
				res.should.have.status(400);
				res.should.be.an('object');
				res.body.should.have.a.property('message').equal('User not found');
				done();
			});
	});

	it('should unfollow the other user', (done) => {
		chai.request(server)
			.put('/api/user/link/' + goodUser2._id)
			.set('token', userToken)
			.end((err, res) => {
				res.should.have.status(200);
				res.should.be.an('object');
				res.body.should.have.a.property('message').equal('User has been unfollowed');
				done();
			});
	});

	it('should follow the other user again', (done) => {
		chai.request(server)
			.put('/api/user/link/' + goodUser2._id)
			.set('token', userToken)
			.end((err, res) => {
				res.should.have.status(200);
				res.should.be.an('object');
				res.body.should.have.a.property('message').equal('User ' + goodUser2.firstName + ' ' + goodUser2.lastName + ' has been followed');
				done();
			});
	});

	/*it('should get only the desired fields in the friend list', (done) => {
		chai.request(server)
			.get('/api/user/' + userToken + '?firstName=true')
			.set('token', userToken)
			.end((err, res) => {
				res.should.have.status(200);
				res.should.be.an('object');
				res.body.should.have.a.property('message').equal('OK');
				res.body.should.have.a.property('data').to.be.an('object');
				res.body.data.should.not.have.a.property('username');
				res.body.data.should.have.a.property('firstName').equal(goodUser.firstName);
				done();
			});
	});*/
});
