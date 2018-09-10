/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

// Get post

describe('Get post', () => {
    it('should get the newly created posts', () => {
	chai.request(server)
	    .get('/api/post')
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('data').to.be.an('array');
		res.body.data.lenght.should.be.at.least(2);
		res.body.should.have.a.property('message').equal('OK');
	    });
    });

    it('should get the comment only', () => {
	chai.request(server)
	    .get('/api/post/' + commentId)
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('data').to.be.an('object');
		res.body.should.have.a.property('message').equal('OK');
		res.body.data.should.have.a.property('parent').equal(postId);
	    });
    });

    it('should get the comment in the post comment list', () => {
	chai.request(server)
	    .get('/api/post/' + postId)
	    .set('token', userToken)
	    .end((err, res) => {
		res.should.have.status(200);
		res.should.be.an('object');
		res.body.should.have.a.property('data').to.be.an('object');
		res.body.should.have.a.property('message').equal('OK');
		res.body.data.should.have.a.property('comments').to.be.an('array');
		res.body.data.comments.length.should.be.equal(1);
		res.body.data.comments[0].should.be.equal(postId);
	    });
    });
});
