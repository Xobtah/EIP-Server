/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

// Get notification

describe('Get notification', () => {
    before((done) => {
	new Notification({ from: goodUser2._id, to: goodUser._id, type: 'type1' }).save();
	new Notification({ from: goodUser2._id, to: goodUser._id, type: 'type2' }).save();
	new Notification({ from: goodUser2._id, to: goodUser._id, type: 'type3' }).save();
	new Notification({ from: goodUser2._id, to: goodUser._id, type: 'type4' }).save();
	new Notification({ from: goodUser._id, to: goodUser2._id, type: 'type1' }).save();
	done();
    });

    it('should get the notifications of the current user', (done) => {
	chai.request(server)
	    .get('/api/notif')
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('data').to.be.an('array');
		res.body.data.length.should.be.equal(4);
		res.body.should.have.a.property('message').equal('OK');
		done();
	    });
    });

    it('should get the notifications of the other user', (done) => {
	chai.request(server)
	    .get('/api/notif')
	    .set('token', userToken2)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('data').to.be.an('array');
		res.body.data.length.should.be.equal(1);
		res.body.should.have.a.property('message').equal('OK');
		done();
	    });
    });

    it('should delete all the notifications of the current user', (done) => {
	chai.request(server)
	    .delete('/api/notif')
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('message').equal('Notifications deleted');
		done();
	    });
    });

    it('should get no notification for the current user', (done) => {
	chai.request(server)
	    .get('/api/notif')
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('data').to.be.an('array');
		res.body.data.length.should.be.equal(0);
		res.body.should.have.a.property('message').equal('OK');
		done();
	    });
    });

    it('should delete all the notifications of the other user', (done) => {
	chai.request(server)
	    .delete('/api/notif')
	    .set('token', userToken2)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('message').equal('Notifications deleted');
		done();
	    });
    });
});
