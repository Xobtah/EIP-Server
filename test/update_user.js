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
	    .send({ password: goodUser.password.split('').reverse().join(''),
		    newPassword: goodUser.password.split('').reverse().join('') })
	    .end((err, res) => {
		res.should.have.status(403);
		res.should.be.an('object');
		res.body.should.have.a.property('message').equal('Incorrect password');
		done();
	    });
    });

    it('should not change password, missing field newPassword', () => {
	chai.request(server)
	    .put('/api/user/password')
	    .set('token', userToken)
	    .send({ password: goodUser })
	    .end((err, res) => {
		res.should.have.status(403);
		res.should.be.an('object');
		res.body.should.have.a.property('message').equal("Missing key 'newPassword' in body");
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

    it('should change username', (done) => {
	chai.request(server)
	    .put('/api/user')
	    .set('token', userToken)
	    .send({ username: goodUser.username + 'aya' })
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('message').equal('User ' + goodUser.username + 'aya' + ' has been updated');
		done();
	    });
    });
});
