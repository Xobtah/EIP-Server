/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

// Create user

describe('Register user', () => {
    before((done) => {
	User.find({ email: { $in: [ goodUser.email, goodUser2.email ] } }).remove(() => done());
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
