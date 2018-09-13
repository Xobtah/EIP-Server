/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

// Update post

describe('Like/unlike post', () => {
    it('should like a post', (done) => {
	chai.request(server)
	    .put('/api/post/like/' + postId)
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('message').equal('OK');
		done();
	    });
    });

    it('should show the like', (done) => {
	chai.request(server)
	    .get('/api/post/' + postId)
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('data').to.be.an('object');
		res.body.data.should.have.a.property('likes').to.be.an('array');
		res.body.data.likes.length.should.be.equal(1);
		res.body.data.likes[0].should.be.equal(goodUser._id);
		done();
	    });
    });

    it('should unlike a post', (done) => {
	chai.request(server)
	    .put('/api/post/like/' + postId)
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('message').equal('OK');
		done();
	    });
    });

    it('shouldn\'t show the like', (done) => {
	chai.request(server)
	    .get('/api/post/' + postId)
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('data').to.be.an('object');
		res.body.data.should.have.a.property('likes').to.be.an('array');
		res.body.data.likes.length.should.be.equal(0);
		done();
	    });
    });

    it('should like a comment', (done) => {
	chai.request(server)
	    .put('/api/post/like/' + commentId)
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('message').equal('OK');
		done();
	    });
    });

    it('should show the like', (done) => {
	chai.request(server)
	    .get('/api/post/' + commentId)
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('data').to.be.an('object');
		res.body.data.should.have.a.property('likes').to.be.an('array');
		res.body.data.likes.length.should.be.equal(1);
		res.body.data.likes[0].should.be.equal(goodUser._id);
		done();
	    });
    });

    it('should unlike a comment', (done) => {
	chai.request(server)
	    .put('/api/post/like/' + commentId)
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('message').equal('OK');
		done();
	    });
    });

    it('shouldn\'t show the like', (done) => {
	chai.request(server)
	    .get('/api/post/' + commentId)
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('data').to.be.an('object');
		res.body.data.should.have.a.property('likes').to.be.an('array');
		res.body.data.likes.length.should.be.equal(0);
		done();
	    });
    });
});
