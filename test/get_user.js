/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

// Get user

describe('Get user', () => {
    it('should get current user data', (done) => {
	chai.request(server)
	    .get('/api/user')
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('message').equal('OK');
		res.body.should.have.a.property('data').to.be.an('object');
		res.body.data.should.have.a.property('username').equal(goodUser.username);
		res.body.data.should.have.a.property('_id');
		goodUser._id = res.body.data._id;
		done();
	    });
    });

    it('should get other user data', (done) => {
	chai.request(server)
	    .get('/api/user')
	    .set('token', userToken2)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('message').equal('OK');
		res.body.should.have.a.property('data').to.be.an('object');
		res.body.data.should.have.a.property('username').equal(goodUser2.username);
		res.body.data.should.have.a.property('_id');
		goodUser2._id = res.body.data._id;
		done();
	    });
    });

    it('should get current user data by id', () => {
	chai.request(server)
	    .get('/api/user/' + goodUser._id)
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('message').equal('OK');
		res.body.should.have.a.property('data').to.be.an('object');
		res.body.data.should.have.a.property('username').equal(goodUser.username);
		res.body.data.should.have.a.property('_id');
	    });
    });

    it('should not give data, missing token', (done) => {
	chai.request(server)
	    .get('/api/user')
	    .end((err, res) => {
		res.should.have.status(403);
		done();
	    });
    });

    it('should find the user with the pattern', (done) => {
	chai.request(server)
	    .get('/api/user/p/hell')
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.body.should.have.a.property('data').to.be.an('array');
		res.body.data.length.should.be.at.least(1);
		done();
	    });
    });

    it('shouldn\'t find the user with the pattern', (done) => {
	chai.request(server)
	    .get('/api/user/p/spacespacespaceilovespaceiwanttogoinspace')
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.body.should.have.a.property('data').to.be.an('array');
		res.body.data.length.should.be.equal(0);
		done();
	    });
    });

    it('should find a user by username', (done) => {
	chai.request(server)
	    .get('/api/user/q/' + goodUser.username)
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('data').to.be.an('object');
		res.body.data.should.have.a.property('username').to.be.equal(goodUser.username);
		done();
	    });
    });

    it('shouldn\'t accept query, no token', (done) => {
	chai.request(server)
	    .get('/api/user/q/' + goodUser.username)
	    .end((err, res) => {
		res.should.have.status(403);
		res.should.be.an('object');
		res.body.should.have.a.property('message').equal('No token provided');
		done();
	    });
    });

    it('shouldn\'t find the user, wrong username', (done) => {
	chai.request(server)
	    .get('/api/user/q/' + goodUser.username.split('').reverse().join(''))
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(403);
		res.should.be.an('object');
		res.body.should.have.a.property('message').equal('User ' + goodUser.username.split('').reverse().join('') + ' not found');
		done();
	    });
    });
});
